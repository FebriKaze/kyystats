import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

let envPath = '/Users/kyy0x4/Documents/WebApp/kyy-stats/kyystats/.env';
if (!require('fs').existsSync(envPath)) {
  envPath = '/Users/kyy0x4/Documents/WebApp/kyy-stats/kyystats/.env.local';
}
const envContent = readFileSync(envPath, 'utf8');
const env = dotenv.parse(envContent);

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('statistics').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
    
    // Check if we can do an empty insert to see the columns required
    // Actually, just fetching the first row gives us the columns
  }

  // To be absolutely sure about columns, let's force an error on insert
  const { error: err2 } = await supabase.from('statistics').insert([{ 
    author_test_non_existent: 'foo',
  }]);
  
  console.log('Insert error schema hint:', err2?.message, err2?.details);
}

check();
