import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { isActive } = body;

    const updatedBanner = await prisma.banner.update({
      where: { id: params.id },
      data: { isActive },
    });
    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 });
  }
}
