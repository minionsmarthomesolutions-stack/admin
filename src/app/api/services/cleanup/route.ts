import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Delete all rows where id is null
    const { data, error } = await supabase
      .from('services')
      .delete()
      .is('id', null);

    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully deleted all services with NULL ids from the database.',
      details: data
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
