import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}

async function uploadBase64Image(base64Str: string | null, slot: string): Promise<string | null> {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str; // Already a URL or null
  
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.split('/')[1] || 'webp';
    const fileName = `${slot}_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Base64 upload failed:', error);
    return null;
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    
    if (body.banners?.a?.image) {
      body.banners.a.image = await uploadBase64Image(body.banners.a.image, 'banner_a');
    }
    if (body.banners?.b?.image) {
      body.banners.b.image = await uploadBase64Image(body.banners.b.image, 'banner_b');
    }

    const { data: existingData } = await supabase.from('banners').select('document').eq('id', id).single();
    const existingDocument = existingData?.document || {};
    
    const documentData = {
      ...existingDocument,
      ...body,
      updatedAt: new Date().toISOString()
    };

    const { data: updatedBanner, error } = await supabase
      .from('banners')
      .update({ document: documentData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: updatedBanner.id, ...updatedBanner.document });
  } catch (error) {
    console.error('Update banner error:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}
