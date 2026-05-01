import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products — list all products ordered by newest
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('groupId') || '';

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { category: { contains: search, mode: 'insensitive' } },
                  { mainCategory: { contains: search, mode: 'insensitive' } },
                  { productGroupId: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          groupId ? { productGroupId: groupId } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
