import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ── Supabase Storage upload helper ──────────────────────────────────────────
async function uploadBase64Image(base64Str: string | null | undefined, folder: string): Promise<string | null> {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str ?? null;
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.split('/')[1] || 'webp';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('services').upload(fileName, buffer, { contentType, upsert: true });
    if (error) { console.error('Storage upload error:', error); return null; }
    const { data } = supabase.storage.from('services').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error('Base64 upload failed:', e);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('services').select('*');
    if (error) throw error;

    console.log('--- SUPABASE RAW ROW 0 ---', data && data[0]);

    const services = data.map(d => ({ ...(d.document || {}), id: d.id }));
    services.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // ── Unique slug ────────────────────────────────────────────────────────
    const slugBase = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = slugBase;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase.from('services').select('id').eq('document->>slug', slug).maybeSingle();
      if (!existing) break;
      slug = `${slugBase}-${counter++}`;
    }

    // ── Upload gallery images to Supabase Storage ─────────────────────────
    const galleryUrls: (string | null)[] = await Promise.all(
      (data.galleryImages || []).map((img: string, i: number) => uploadBase64Image(img, `gallery/${slug}/slot_${i}`))
    );

    // ── Upload package feature images ──────────────────────────────────────
    const processedPackages = { ...data.packages };
    for (const pkgKey of ['basic', 'premium', 'elite'] as const) {
      const pkg = processedPackages[pkgKey];
      if (!pkg) continue;
      pkg.price = parseFloat(pkg.price) || 0;
      for (const listKey of ['included', 'notIncluded', 'complimentary'] as const) {
        if (pkg[listKey]) {
          pkg[listKey] = await Promise.all(
            pkg[listKey].map(async (item: any) => ({
              ...item,
              image: item.image ? await uploadBase64Image(item.image, `pkg/${slug}/${pkgKey}/${listKey}`) : null
            }))
          );
        }
      }
      // Upload package gallery images
      if (pkg.galleryImages) {
        pkg.galleryImages = await Promise.all(
          pkg.galleryImages.map((img: string, i: number) => uploadBase64Image(img, `pkg/${slug}/${pkgKey}/gallery_${i}`))
        );
      }
    }

    const documentData = {
      name: data.name,
      slug,
      serviceCode: data.serviceCode,
      description: data.description,
      mainCategory: data.mainCategory,
      category: data.category,
      subcategory: data.subcategory,
      galleryImages: galleryUrls.filter(Boolean),
      packages: processedPackages,
      seoTags: data.seoTags || [],
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newId = crypto.randomUUID();

    const { data: service, error } = await supabase
      .from('services')
      .insert([{ id: newId, document: documentData }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, service: { id: service.id, ...service.document } });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

