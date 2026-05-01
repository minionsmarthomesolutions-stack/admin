import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
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
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error('[PUT /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
