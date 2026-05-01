import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.banner.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updatedBanner = await prisma.banner.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}
