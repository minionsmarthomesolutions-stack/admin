import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, categoryId, productName, imageA, imageB } = body;
    
    if (!title || !type || !categoryId) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    const newBanner = await prisma.banner.create({
      data: {
        title,
        type,
        categoryId,
        productName,
        imageA,
        imageB,
      }
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
