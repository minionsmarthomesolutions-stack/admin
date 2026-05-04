import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scfpopriukcegyvapfli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZnBvcHJpdWtjZWd5dmFwZmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzQzOTgsImV4cCI6MjA5MTMxMDM5OH0.pvL79uHxxTe14A21A6-ulxJ5c9boMxm0zSZgCWRYyBs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: b } = await supabase.from('banners').select('*');
  console.log('BANNERS:', JSON.stringify(b, null, 2));

  const { data: c } = await supabase.from('categories').select('id');
  console.log('CATEGORIES:', c);
}
test();
