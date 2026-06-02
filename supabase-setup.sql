-- Copy and paste this into your Supabase SQL Editor
-- This will create the 'attendees' table and set up the correct policies

CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  "fullName" text NOT NULL,
  npk text NOT NULL,
  address text,
  city text,
  province text,
  "schoolName" text,
  "phoneWA" text,
  "studyField" text,
  "photoUrl" text,
  "attendanceType" text,
  "paymentHotelBank" text,
  "paymentHotelAccountName" text,
  "paymentHotelAccountNumber" text,
  "paymentHotelProofUrl" text,
  "paymentLegalisirBank" text,
  "paymentLegalisirAccountName" text,
  "paymentLegalisirAccountNumber" text,
  "paymentLegalisirProofUrl" text,
  "certificateRetrievalMethod" text,
  "isRegistered" boolean DEFAULT false,
  status text DEFAULT 'PENDING'
);

-- Turn off Row Level Security (RLS) entirely so Vercel can insert/read without auth restrictions.
-- Alternatively, if you want secure, leave RLS on and create a policy.
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled but allowing public reads and inserts (for a registration form):
-- ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public inserts" ON attendees FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public reads" ON attendees FOR SELECT USING (true);
-- CREATE POLICY "Allow public updates" ON attendees FOR UPDATE USING (true);
-- CREATE POLICY "Allow public deletes" ON attendees FOR DELETE USING (true);
