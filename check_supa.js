import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function check() {
  if (url && key) {
    const supabase = createClient(url, key);
    const { data } = await supabase.from('attendees').select('id, fullName, npk').limit(5);
    if (data && data.length > 0) {
      console.log(data);
    } else {
      console.log('No data found at all');
    }
  }
}
check();
