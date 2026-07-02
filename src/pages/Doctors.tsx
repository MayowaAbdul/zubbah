import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Search,
  CalendarDays,
  MapPin,
  Star,
  GraduationCap,
  Award,
  ArrowRight,
  X,
  Phone,
  Mail,
  Filter,
  Users,
} from "lucide-react";
import { supabase, type Doctor } from "../lib/supabase";
import { cn } from "../lib/utils";

const specialties = [
  "All",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "General Medicine",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      const { data, error } = await supabase.from("doctors").select("*").order("name");
      if (!error && data) {
        setDoctors(data);
      }
      setLoading(false);
    }
    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === "All" || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [search, selectedSpecialty, doctors]);

  const doctorDetail = doctors.find((d) => d.id === selectedDoctor);

  const stats = useMemo(() => {
    return {
      total: doctors.length,
      specialties: new Set(doctors.map((d) => d.specialty)).size,
    };
  }, [doctors]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Our Doctors</h1>
          <p className="text-sm text-slate-500">
            Browse qualified healthcare providers and their availability.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Doctors", value: stats.total, icon: Users },
            { label: "Specialties", value: stats.specialties, icon: Stethoscope },
            { label: "Available Today", value: "4+", icon: CalendarDays },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Icon size={16} />
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name or specialty..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedSpecialty === s
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((d) => {
            return (
              <motion.div
                key={d.id}
                variants={item}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{d.name}</div>
                    <div className="flex items-center gap-1 text-xs text-teal-700">
                      <Stethoscope size={12} />
                      {d.specialty}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Star size={12} className="text-amber-400" />
                      <Star size={12} className="text-amber-400" />
                      <Star size={12} className="text-amber-400" />
                      <Star size={12} className="text-amber-400" />
                      <Star size={12} className="text-amber-400" />
                      <span className="ml-1">4.9</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Available Days
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.available_days.map((day) => (
                      <span
                        key={day}
                        className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Hours
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {d.available_hours.slice(0, 4).map((h) => (
                      <span
                        key={h}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {h}
                      </span>
                    ))}
                    {d.available_hours.length > 4 && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        +{d.available_hours.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Available for booking
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDoctor(d.id)}
                      className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      View Profile
                    </button>
                    <Link
                      to="/book"
                      state={{ doctorId: d.id }}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
                    >
                      Book
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Stethoscope size={40} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">No doctors found matching your criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selectedDoctor && doctorDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={doctorDetail.image}
                    alt={doctorDetail.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{doctorDetail.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-teal-700">
                      <Stethoscope size={14} />
                      {doctorDetail.specialty}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <span className="ml-1 text-slate-500">4.9 (120 reviews)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <GraduationCap size={18} className="mt-0.5 text-teal-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Education</div>
                    <div className="text-xs text-slate-500">
                      MD, Harvard Medical School. Board Certified in {doctorDetail.specialty}.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <Award size={18} className="mt-0.5 text-teal-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Experience</div>
                    <div className="text-xs text-slate-500">
                      15+ years of clinical practice. Former head of department at City General Hospital.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <MapPin size={18} className="mt-0.5 text-teal-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Location</div>
                    <div className="text-xs text-slate-500">
                      Main Hospital, Floor 3, Suite 302
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <Phone size={18} className="mt-0.5 text-teal-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Contact</div>
                    <div className="text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> +1 555-0200
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> {doctorDetail.name.toLowerCase().replace(/ /g, ".")}@medschedule.com
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">Availability</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {doctorDetail.available_days.map((day) => (
                      <div
                        key={day}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <CalendarDays size={14} className="text-teal-600" />
                        <div className="text-xs text-slate-700">
                          <div className="font-medium">{day}</div>
                          <div className="text-slate-400">
                            {doctorDetail.available_hours[0]} - {doctorDetail.available_hours[doctorDetail.available_hours.length - 1]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  to="/book"
                  state={{ doctorId: doctorDetail.id }}
                  onClick={() => setSelectedDoctor(null)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Book Appointment
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
