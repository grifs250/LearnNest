import { createClient } from '@supabase/supabase-js';
import { formatClerkId } from '../lib/utils/helpers';

// Šis ir vienkāršs tests, lai pārbaudītu, vai formatClerkId funkcija darbojas pareizi
// un vai datu bāze pieņem formatētos ID

async function testProfileIdFormat() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Testa ID, ko formatēt
  const testClerkId = 'user_2a4b6c8d0e2f4g6h8i0j2k4l6m8n0o2p';
  const formattedId = formatClerkId(testClerkId);
  
  console.log(`Original Clerk ID: ${testClerkId}`);
  console.log(`Formatted ID: ${formattedId}`);
  console.log(`Length: ${formattedId.length}`);
  
  // Pārbaudām, vai datu bāzē jau pastāv šāds ID
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', formattedId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking profile:', error);
    return;
  }
  
  if (data) {
    console.log('Profile with this ID already exists');
  } else {
    console.log('No profile found with this ID - format is valid for new profiles');
  }
}

testProfileIdFormat()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 