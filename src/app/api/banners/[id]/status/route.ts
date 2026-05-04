import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { isActive } = body;

    const { data: existingData } = await supabase.from('banners').select('document').eq('id', id).single();
    const existingDocument = existingData?.document || {};
    
    const documentData = {
      ...existingDocument,
      isActive,
      updatedAt: new Date().toISOString()
    };

    const { data: updatedBanner, error } = await supabase
      .from('banners')
      .update({ document: documentData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: updatedBanner.id, ...updatedBanner.document });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 });
  }
}
