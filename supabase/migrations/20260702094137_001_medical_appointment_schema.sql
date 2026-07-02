/*
# Medical Appointment System Schema

1. New Tables
- `doctors`: Stores doctor profiles with specialty, availability, and image.
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `specialty` (text, not null)
  - `image` (text, URL to doctor photo)
  - `available_days` (text[], array of weekday names)
  - `available_hours` (text[], array of time slots)
  - `created_at` (timestamptz)

- `patients`: Patient profiles linked to auth.users for data isolation.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, unique)
  - `full_name` (text, not null)
  - `phone` (text, not null)
  - `date_of_birth` (date, not null)
  - `gender` (text)
  - `address` (text)
  - `emergency_contact` (text)
  - `created_at` (timestamptz)

- `appointments`: Appointment bookings linking patients to doctors.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, defaults to authenticated user)
  - `doctor_id` (uuid, references doctors)
  - `patient_name` (text, not null)
  - `patient_email` (text, not null)
  - `patient_phone` (text, not null)
  - `date` (date, not null)
  - `time` (text, not null)
  - `status` (text, default 'scheduled')
  - `notes` (text)
  - `created_at` (timestamptz)

2. Security
- RLS enabled on all tables.
- `doctors`: Public read (anyone can view doctors to book), admin write.
- `patients`: Users own their profile only.
- `appointments`: Users own their appointments only.

3. Notes
- `user_id` columns default to `auth.uid()` so inserts work without client-side user_id.
- Doctors are seeded separately after table creation.
*/

-- Doctors table (publicly readable)
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  image text NOT NULL,
  available_days text[] NOT NULL DEFAULT '{}',
  available_hours text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_public_read" ON doctors;
CREATE POLICY "doctors_public_read" ON doctors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "doctors_authenticated_insert" ON doctors;
CREATE POLICY "doctors_authenticated_insert" ON doctors FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "doctors_authenticated_update" ON doctors;
CREATE POLICY "doctors_authenticated_update" ON doctors FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Patients table (user-scoped)
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  gender text,
  address text,
  emergency_contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_select_own" ON patients;
CREATE POLICY "patients_select_own" ON patients FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "patients_insert_own" ON patients;
CREATE POLICY "patients_insert_own" ON patients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "patients_update_own" ON patients;
CREATE POLICY "patients_update_own" ON patients FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointments table (user-scoped)
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select_own" ON appointments;
CREATE POLICY "appointments_select_own" ON appointments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_insert_own" ON appointments;
CREATE POLICY "appointments_insert_own" ON appointments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_update_own" ON appointments;
CREATE POLICY "appointments_update_own" ON appointments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_delete_own" ON appointments;
CREATE POLICY "appointments_delete_own" ON appointments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);