import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');
      
    if (error) throw error;
    
    const services = data.map(d => ({ id: d.id, ...(d.document || {}) }));
    
    // Sort by createdAt desc
    services.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

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
      const { data: existing } = await supabase.from('services').select('id').eq('document->>slug', slug).maybeSingle();
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

    const documentData = {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: service, error } = await supabase
      .from('services')
      .insert([{ document: documentData }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, service: { id: service.id, ...service.document } });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
