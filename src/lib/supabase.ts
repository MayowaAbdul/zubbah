import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available_days: string[];
  available_hours: string[];
  created_at: string;
};

export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
  created_at: string;
};
