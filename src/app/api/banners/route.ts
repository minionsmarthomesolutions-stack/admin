import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*');

    if (error) throw error;
    
    const banners = data.map(d => ({ id: d.id, ...(d.document || {}) }));

    // Sort by createdAt desc
    banners.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

async function uploadBase64Image(base64Str: string | null, slot: string): Promise<string | null> {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str; // Already a URL or null
  
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.split('/')[1] || 'webp';
    const fileName = `${slot}_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Base64 upload failed:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, categoryId, banners } = body;
    
    if (!title || !type || !categoryId) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    if (banners?.a?.image) {
      banners.a.image = await uploadBase64Image(banners.a.image, 'banner_a');
    }
    if (banners?.b?.image) {
      banners.b.image = await uploadBase64Image(banners.b.image, 'banner_b');
    }

    const bannerId = crypto.randomUUID();

    const documentData = {
      ...body,
      banners,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: newBanner, error } = await supabase
      .from('banners')
      .insert([{ id: bannerId, document: documentData }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: newBanner.id, ...newBanner.document }, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
