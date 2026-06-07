import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function check() {
  if (url && key) {
    const supabase = createClient(url, key);
    const { data: allRows, error } = await supabase.from('attendees')
      .select('id, fullName, photoUrl, paymentHotelProofUrl, paymentLegalisirProofUrl');
    
    if (error) {
      console.error('Error fetching:', error);
      return;
    }
    
    console.log(`Total attendees fetched: ${allRows.length}`);
    
    const withYesPhotos = allRows.filter(r => r.photoUrl === 'yes');
    const withBase64Photos = allRows.filter(r => r.photoUrl && r.photoUrl !== 'yes' && r.photoUrl.startsWith('data:'));
    const withNullPhotos = allRows.filter(r => !r.photoUrl);
    
    console.log(`Photos: yes=${withYesPhotos.length}, base64=${withBase64Photos.length}, null=${withNullPhotos.length}`);
    
    const withYesLegalisir = allRows.filter(r => r.paymentLegalisirProofUrl === 'yes');
    const withBase64Legalisir = allRows.filter(r => r.paymentLegalisirProofUrl && r.paymentLegalisirProofUrl !== 'yes' && r.paymentLegalisirProofUrl.startsWith('data:'));
    const withNullLegalisir = allRows.filter(r => !r.paymentLegalisirProofUrl);
    
    console.log(`Legalisir Proofs: yes=${withYesLegalisir.length}, base64=${withBase64Legalisir.length}, null=${withNullLegalisir.length}`);

    const withYesHotel = allRows.filter(r => r.paymentHotelProofUrl === 'yes');
    const withBase64Hotel = allRows.filter(r => r.paymentHotelProofUrl && r.paymentHotelProofUrl !== 'yes' && r.paymentHotelProofUrl.startsWith('data:'));
    const withNullHotel = allRows.filter(r => !r.paymentHotelProofUrl);
    
    console.log(`Hotel Proofs: yes=${withYesHotel.length}, base64=${withBase64Hotel.length}, null=${withNullHotel.length}`);

    if (withBase64Legalisir.length > 0) {
      console.log('Sample base64 Legalisir attendee:', withBase64Legalisir[0].fullName);
    }
    if (withBase64Photos.length > 0) {
      console.log('Sample base64 Photo attendee:', withBase64Photos[0].fullName);
    }
  } else {
    console.log('No keys!');
  }
}
check();
