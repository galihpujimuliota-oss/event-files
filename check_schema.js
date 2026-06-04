import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
  if (url && key) {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('attendees').select('*').limit(1);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
       console.log('Error or no data:', error);
    }
  }
}
check();
