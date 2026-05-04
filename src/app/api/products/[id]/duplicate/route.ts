import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/products/[id]/duplicate
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  try {
    const { data: originalData, error: findError } = await supabase
      .from('products')
      .select('*')
      .eq('id', paramId)
      .single();

    if (findError || !originalData) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const original = originalData.document || {};
    const { id, createdAt, updatedAt, ...rest } = original;

    const newDocument = {
      ...rest,
      name: `${rest.name || 'Product'} (Copy)`,
      productGroupId: null,
      mainCategory: '',
      category: '',
      subcategory: '',
      status: 'active',
      stockStatus: 'in_stock',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: duplicate, error: createError } = await supabase
      .from('products')
      .insert([{ document: newDocument }])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({ id: duplicate.id, ...duplicate.document }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products/[id]/duplicate]', err);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
}
