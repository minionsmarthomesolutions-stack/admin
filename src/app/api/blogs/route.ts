import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ── Supabase Storage upload helper ───────────────────────────────────────────
async function uploadBase64Image(base64Str: string | null | undefined, folder: string): Promise<string | null> {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str ?? null;
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.split('/')[1] || 'webp';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('blogs').upload(fileName, buffer, { contentType, upsert: true });
    if (error) { console.error('Storage upload error:', error); return null; }
    const { data } = supabase.storage.from('blogs').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error('Base64 upload failed:', e);
    return null;
  }
}

// GET /api/blogs — list all blogs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const { data, error } = await supabase
      .from('blogs')
      .select('*');

    if (error) {
      throw error;
    }

    let blogs = data.map(d => ({ id: d.id, ...(d.document || {}) }));

    // Apply filtering in memory
    if (search) {
      const s = search.toLowerCase();
      blogs = blogs.filter(b =>
        b.title?.toLowerCase().includes(s) ||
        b.category?.toLowerCase().includes(s)
      );
    }

    // Sort by createdAt desc
    blogs.sort((a, b) => {
      const dateA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return dateB - dateA;
    });

    return NextResponse.json(blogs);
  } catch (err) {
    console.error('[GET /api/blogs]', err);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/blogs — create a new blog (uploads primaryImage to Supabase Storage)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Upload primary image to Supabase Storage
    const primaryImage = await uploadBase64Image(body.primaryImage, 'primary');

    const documentData = {
      ...body,
      primaryImage: primaryImage || body.primaryImage || null,
      imageUrl: primaryImage || body.primaryImage || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert([{ document: documentData }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ id: data.id, ...data.document }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/blogs]', err);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
