import fetch from 'node-fetch';

async function test() {
  const all = await fetch('http://localhost:3000/api/attendees').then(r => r.json());
  const keys = Object.keys(all);
  console.log(`Found ${keys.length} attendees locally`);
  if (keys.length > 0) {
    const first = all[keys[0]];
    console.log('paymentHotelProofUrl:', first.paymentHotelProofUrl ? (first.paymentHotelProofUrl.length > 10 ? 'base64 data...' : first.paymentHotelProofUrl) : 'null');
  }
}
test();
