import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/categories]', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
