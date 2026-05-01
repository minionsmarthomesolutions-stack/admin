import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Generate a unique slug if not provided
    const slugBase = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = slugBase;
    let counter = 1;
    while (true) {
      const existing = await prisma.service.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${slugBase}-${counter}`;
      counter++;
    }

    // Process packages to ensure price is a number
    const processedPackages = { ...data.packages };
    if (processedPackages) {
      ['basic', 'premium', 'elite'].forEach(pkg => {
        if (processedPackages[pkg]) {
          processedPackages[pkg].price = parseFloat(processedPackages[pkg].price) || 0;
        }
      });
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug: slug,
        serviceCode: data.serviceCode,
        description: data.description,
        mainCategory: data.mainCategory,
        category: data.category,
        subcategory: data.subcategory,
        galleryImages: data.galleryImages || [],
        packages: processedPackages,
        seoTags: data.seoTags || [],
        status: data.status || 'draft',
      }
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
