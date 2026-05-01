import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/products/[id]/duplicate
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const original = await prisma.product.findUnique({ where: { id: params.id } });
    if (!original) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { id, createdAt, updatedAt, ...rest } = original;

    const duplicate = await prisma.product.create({
      data: {
        ...rest,
        name: `${rest.name} (Copy)`,
        productGroupId: null,
        mainCategory: '',
        category: '',
        subcategory: '',
        status: 'active',
        stockStatus: 'in_stock',
        isActive: true,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products/[id]/duplicate]', err);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
}
