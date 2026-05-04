const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data: banners } = await supabase.from('banners').select('*');
  console.log('BANNERS:', JSON.stringify(banners, null, 2));
  const { data: cats } = await supabase.from('categories').select('id');
  console.log('CATS:', cats);
}
test();
