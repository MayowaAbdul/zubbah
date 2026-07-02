import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { supabase, type Doctor } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Book() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const doctor = doctors.find((d) => d.id === selectedDoctor);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const availableTimes = useMemo(() => {
    if (!doctor || !selectedDate) return [];
    const dayName = weekDays[selectedDate.getDay()];
    if (!doctor.available_days.includes(dayName)) return [];
    return doctor.available_hours;
  }, [doctor, selectedDate]);

  function validateForm() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirm() {
    if (!validateForm() || !doctor || !selectedDate || !selectedTime || !user) return;
    setSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      doctor_id: doctor.id,
      patient_name: form.name,
      patient_email: form.email,
      patient_phone: form.phone,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "scheduled",
      notes: form.notes || null,
    });

    setSubmitting(false);

    if (error) {
      setErrors({ form: error.message });
    } else {
      setStep(4);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["Select Doctor", "Pick Date", "Your Details", "Confirmation"].map((label, idx) => {
              const s = idx + 1;
              const active = step === s;
              const done = step > s;
              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        done ? "bg-teal-600 text-white" : active ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-500"
                      )}
                    >
                      {done ? <CheckCircle size={16} /> : s}
                    </div>
                    <span className={cn("mt-1 hidden text-xs font-medium sm:block", active ? "text-teal-700" : "text-slate-400")}>
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={cn("mx-2 h-0.5 flex-1 rounded-full", done ? "bg-teal-600" : "bg-slate-200")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-lg font-bold text-slate-900">Choose a Doctor</h2>
                <p className="text-sm text-slate-500">Select a specialist for your appointment.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDoctor(d.id);
                        setStep(2);
                      }}
                      className={cn(
                        "flex items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                        selectedDoctor === d.id
                          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
                          : "border-slate-200 bg-white hover:border-teal-300"
                      )}
                    >
                      <img src={d.image} alt={d.name} className="h-14 w-14 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900">{d.name}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-teal-700">
                          <Stethoscope size={12} />
                          {d.specialty}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {d.available_days.slice(0, 3).map((day) => (
                            <span key={day} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {day.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Select Date & Time</h2>
                    <p className="text-sm text-slate-500">
                      Booking with {doctor?.name} — {doctor?.specialty}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays size={16} />
                    This Week
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {weekDates.map((date) => {
                      const dayName = weekDays[date.getDay()];
                      const available = doctor?.available_days.includes(dayName) ?? false;
                      const selected = selectedDate ? isSameDay(date, selectedDate) : false;
                      return (
                        <button
                          key={date.toISOString()}
                          disabled={!available}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={cn(
                            "flex flex-col items-center rounded-xl border py-3 text-xs transition-all",
                            selected
                              ? "border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500"
                              : available
                              ? "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                              : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                          )}
                        >
                          <span className="font-medium">{format(date, "EEE")}</span>
                          <span className="mt-1 text-lg font-bold">{format(date, "d")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Clock size={16} />
                      Available Times
                    </div>
                    {availableTimes.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-400">No available slots on this day.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {availableTimes.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={cn(
                              "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                              selectedTime === t
                                ? "border-teal-500 bg-teal-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(2)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Your Details</h2>
                    <p className="text-sm text-slate-500">Confirm your appointment details.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <img src={doctor?.image} alt={doctor?.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-900">{doctor?.name}</div>
                      <div className="text-xs text-slate-500">{doctor?.specialty}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-teal-600" />
                      {selectedDate ? format(selectedDate, "EEEE, MMM d") : ""}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-teal-600" />
                      {selectedTime}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      placeholder="John Doe"
                      className={cn(
                        "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20",
                        errors.name ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                      )}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder="john@example.com"
                      className={cn(
                        "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20",
                        errors.email ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                      )}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="+1 555-0000"
                      className={cn(
                        "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20",
                        errors.phone ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                      )}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Any symptoms or concerns..."
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {errors.form && (
                  <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {errors.form}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                    <CheckCircle size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <CheckCircle size={40} />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Your appointment has been scheduled. A confirmation summary is shown below.
                </p>
                <div className="mx-auto mt-8 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
                  <div className="flex items-center gap-3">
                    <img src={doctor?.image} alt={doctor?.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-900">{doctor?.name}</div>
                      <div className="text-xs text-slate-500">{doctor?.specialty}</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-teal-600" />
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-teal-600" />
                      {selectedTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-teal-600" />
                      {form.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-teal-600" />
                      Main Hospital, Room 302
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/appointments")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md"
                >
                  View My Appointments
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
