import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ id: data.id, ...(data.document || {}) });
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    
    // Fetch existing document to merge, or just replace depending on logic.
    // Assuming replace/update the document:
    const documentData: Record<string, any> = {
      name: body.name,
      productGroupId: body.productGroupId || null,
      status: body.status || 'active',
      stockStatus: body.stockStatus || 'in_stock',
      quantity: body.quantity ? Number(body.quantity) : 0,
      currentPrice: body.currentPrice ? Number(body.currentPrice) : 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : 0,
      priceUnit: body.priceUnit || 'per-piece',
      mainCategory: body.mainCategory || null,
      category: body.category || null,
      subcategory: body.subcategory || null,
      brand: body.brand || null,
      hsnCode: body.hsnCode || null,
      gstRate: body.gstRate || null,
      badge: body.badge || null,
      estimatedDelivery: body.estimatedDelivery || null,
      freeShipping: body.freeShipping || false,
      description: body.description || null,
      primaryImageUrl: body.primaryImageUrl || null,
      imageUrl: body.imageUrl || null,
      thumbnailUrls: body.thumbnailUrls || [],
      colorVariant: body.colorVariant || null,
      materials: body.materials || [],
      services: body.services || [],
      features: body.features || [],
      specifications: body.specifications || null,
      warranty: body.warranty || null,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    };

    // We can merge with existing if needed, but Prisma update replaces specified fields anyway.
    // If there were existing fields in document not specified here, they would be lost if we don't merge.
    // Let's fetch first to merge:
    const { data: existingData } = await supabase.from('products').select('document').eq('id', id).single();
    const existingDocument = existingData?.document || {};
    
    // Preserve createdAt if it exists
    if (existingDocument.createdAt) {
      documentData.createdAt = existingDocument.createdAt;
    }

    const { data, error } = await supabase
      .from('products')
      .update({ document: { ...existingDocument, ...documentData } })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, ...data.document });
  } catch (err) {
    console.error('[PUT /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
