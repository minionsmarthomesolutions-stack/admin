import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ id: data.id, ...(data.document || {}) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { data: existing, error: fetchErr } = await supabase.from('services').select('document').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const updatedDoc = {
      ...(existing?.document || {}),
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('services')
      .update({ document: updatedDoc })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id, ...(data.document || {}) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
