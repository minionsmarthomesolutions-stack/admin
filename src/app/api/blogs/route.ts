import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      // Supabase's migrated timestamps might be nested like { _seconds, _nanoseconds } or string
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

// POST /api/blogs — create a new blog
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const documentData = {
      ...body,
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
