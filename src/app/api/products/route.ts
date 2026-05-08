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
    const { error } = await supabase.storage.from('products').upload(fileName, buffer, { contentType, upsert: true });
    if (error) { console.error('Storage upload error:', error); return null; }
    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error('Base64 upload failed:', e);
    return null;
  }
}

// GET /api/products — list all products ordered by newest
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('groupId') || '';

    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      throw error;
    }

    let products = data.map(d => ({ id: d.id, ...(d.document || {}) }));

    // Apply filtering in memory
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s) ||
        p.mainCategory?.toLowerCase().includes(s) ||
        p.productGroupId?.toLowerCase().includes(s)
      );
    }

    if (groupId) {
      products = products.filter(p => p.productGroupId === groupId);
    }

    // Sort by createdAt desc
    products.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product (uploads images to Supabase Storage)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Upload primary image and thumbnails to Supabase Storage
    const primaryImageUrl = await uploadBase64Image(body.primaryImageUrl || body.imageUrl, 'primary');
    const thumbnailUrls: string[] = [];
    if (Array.isArray(body.thumbnailUrls)) {
      for (const img of body.thumbnailUrls) {
        const url = await uploadBase64Image(img, 'thumbnails');
        if (url) thumbnailUrls.push(url);
      }
    }

    const documentData = {
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
      primaryImageUrl: primaryImageUrl || null,
      imageUrl: primaryImageUrl || null,
      thumbnailUrls: thumbnailUrls.length > 0 ? thumbnailUrls : (body.thumbnailUrls || []),
      colorVariant: body.colorVariant || null,
      materials: body.materials || [],
      services: body.services || [],
      features: body.features || [],
      specifications: body.specifications || null,
      warranty: body.warranty || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert([{ document: documentData }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ id: data.id, ...data.document }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
