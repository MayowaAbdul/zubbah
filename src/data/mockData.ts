export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  availableDays: string[];
  availableHours: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  registeredAt: string;
}

export const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    image: "https://images.pexels.com/photos/5327659/pexels-photo-5327659.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
    availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Monday", "Wednesday", "Thursday"],
    availableHours: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"],
  },
  {
    id: "doc-3",
    name: "Dr. Emily Williams",
    specialty: "Pediatrics",
    image: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    availableHours: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"],
  },
  {
    id: "doc-4",
    name: "Dr. James Rodriguez",
    specialty: "Orthopedics",
    image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableHours: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  },
  {
    id: "doc-5",
    name: "Dr. Aisha Patel",
    specialty: "Dermatology",
    image: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Wednesday", "Thursday", "Friday"],
    availableHours: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
  },
  {
    id: "doc-6",
    name: "Dr. Robert Kim",
    specialty: "General Medicine",
    image: "https://images.pexels.com/photos/5327654/pexels-photo-5327654.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
  },
];

export let appointments: Appointment[] = [
  {
    id: "apt-1",
    patientName: "John Smith",
    patientEmail: "john@example.com",
    patientPhone: "+1 555-0101",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2026-06-23",
    time: "10:00",
    status: "scheduled",
    notes: "Follow-up for hypertension",
    createdAt: "2026-06-19T10:00:00Z",
  },
  {
    id: "apt-2",
    patientName: "Mary Johnson",
    patientEmail: "mary@example.com",
    patientPhone: "+1 555-0102",
    doctorId: "doc-3",
    doctorName: "Dr. Emily Williams",
    specialty: "Pediatrics",
    date: "2026-06-24",
    time: "14:00",
    status: "scheduled",
    notes: "Annual checkup for child",
    createdAt: "2026-06-19T11:00:00Z",
  },
  {
    id: "apt-3",
    patientName: "David Brown",
    patientEmail: "david@example.com",
    patientPhone: "+1 555-0103",
    doctorId: "doc-2",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurology",
    date: "2026-06-20",
    time: "09:00",
    status: "completed",
    notes: "Migraine consultation",
    createdAt: "2026-06-15T09:00:00Z",
  },
  {
    id: "apt-4",
    patientName: "Lisa Davis",
    patientEmail: "lisa@example.com",
    patientPhone: "+1 555-0104",
    doctorId: "doc-4",
    doctorName: "Dr. James Rodriguez",
    specialty: "Orthopedics",
    date: "2026-06-25",
    time: "11:00",
    status: "scheduled",
    notes: "Knee pain evaluation",
    createdAt: "2026-06-18T14:00:00Z",
  },
  {
    id: "apt-5",
    patientName: "James Wilson",
    patientEmail: "james@example.com",
    patientPhone: "+1 555-0105",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2026-06-20",
    time: "14:00",
    status: "cancelled",
    notes: "Patient requested cancellation",
    createdAt: "2026-06-17T08:00:00Z",
  },
];

export let patients: Patient[] = [
  {
    id: "pat-1",
    fullName: "John Smith",
    email: "john@example.com",
    phone: "+1 555-0101",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    address: "123 Main St, New York, NY",
    emergencyContact: "Jane Smith +1 555-0199",
    registeredAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "pat-2",
    fullName: "Mary Johnson",
    email: "mary@example.com",
    phone: "+1 555-0102",
    dateOfBirth: "1990-07-22",
    gender: "Female",
    address: "456 Oak Ave, Boston, MA",
    emergencyContact: "Tom Johnson +1 555-0198",
    registeredAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "pat-3",
    fullName: "David Brown",
    email: "david@example.com",
    phone: "+1 555-0103",
    dateOfBirth: "1978-11-30",
    gender: "Male",
    address: "789 Pine Rd, Chicago, IL",
    emergencyContact: "Sarah Brown +1 555-0197",
    registeredAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "pat-4",
    fullName: "Lisa Davis",
    email: "lisa@example.com",
    phone: "+1 555-0104",
    dateOfBirth: "1995-05-18",
    gender: "Female",
    address: "321 Elm St, Seattle, WA",
    emergencyContact: "Mark Davis +1 555-0196",
    registeredAt: "2026-04-20T11:00:00Z",
  },
];

export function addAppointment(apt: Appointment) {
  appointments = [...appointments, apt];
}

export function updateAppointment(id: string, updates: Partial<Appointment>) {
  appointments = appointments.map((a) => (a.id === id ? { ...a, ...updates } : a));
}

export function cancelAppointment(id: string) {
  appointments = appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a));
}

export function addPatient(patient: Patient) {
  patients = [...patients, patient];
}
