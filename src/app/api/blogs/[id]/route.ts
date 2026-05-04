import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/blogs/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ id: data.id, ...(data.document || {}) });
  } catch (err) {
    console.error('[GET /api/blogs/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT /api/blogs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    
    const { data: existingData } = await supabase.from('blogs').select('document').eq('id', id).single();
    const existingDocument = existingData?.document || {};
    
    const documentData = {
      ...existingDocument,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('blogs')
      .update({ document: documentData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, ...data.document });
  } catch (err) {
    console.error('[PUT /api/blogs/[id]]', err);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/blogs/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
