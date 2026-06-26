import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  FileText,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { format, parseISO, addDays, startOfWeek, isSameDay } from "date-fns";
import { appointments, doctors, updateAppointment, cancelAppointment, type Appointment } from "../data/mockData";
import { cn } from "../lib/utils";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusConfig = {
  scheduled: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  rescheduled: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
};

export default function MyAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const matchesSearch =
          a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === "scheduled").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const upcoming = appointments.filter(
      (a) => a.status === "scheduled" && new Date(a.date) >= new Date()
    ).length;
    return { total, scheduled, completed, cancelled, upcoming };
  }, []);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const upcomingDates = useMemo(() => {
    const dates: Record<string, Appointment[]> = {};
    appointments
      .filter((a) => a.status === "scheduled" || a.status === "rescheduled")
      .forEach((a) => {
        if (!dates[a.date]) dates[a.date] = [];
        dates[a.date].push(a);
      });
    return dates;
  }, []);

  function handleCancel(id: string) {
    if (!cancelReason.trim()) return;
    cancelAppointment(id);
    setCancelConfirm(null);
    setCancelReason("");
  }

  function handleReschedule(apt: Appointment) {
    if (!rescheduleDate || !rescheduleTime) return;
    updateAppointment(apt.id, {
      date: format(rescheduleDate, "yyyy-MM-dd"),
      time: rescheduleTime,
      status: "rescheduled",
      notes: apt.notes + (rescheduleReason ? `\n[Rescheduled: ${rescheduleReason}]` : ""),
    });
    setShowReschedule(false);
    setRescheduleDate(null);
    setRescheduleTime(null);
    setRescheduleReason("");
    setSelectedApt(null);
  }

  function getAvailableTimes(doctorId: string, date: Date) {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return [];
    const dayName = weekDays[date.getDay()];
    if (!doctor.availableDays.includes(dayName)) return [];
    const taken = appointments
      .filter((a) => a.doctorId === doctorId && a.date === format(date, "yyyy-MM-dd") && a.status !== "cancelled")
      .map((a) => a.time);
    return doctor.availableHours.filter((h) => !taken.includes(h));
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
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-500">
            Track, reschedule, or cancel your appointments.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { label: "Total", value: stats.total, icon: FileText },
            { label: "Upcoming", value: stats.upcoming, icon: CalendarCheck },
            { label: "Scheduled", value: stats.scheduled, icon: Clock },
            { label: "Completed", value: stats.completed, icon: CheckCircle },
            { label: "Cancelled", value: stats.cancelled, icon: XCircle },
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

        {/* Calendar strip */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarDays size={16} className="text-teal-600" />
            This Week
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayAppts = upcomingDates[dateStr] || [];
              const isToday = isSameDay(date, new Date());
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "rounded-xl border p-3 text-center transition-all",
                    isToday ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white",
                    dayAppts.length > 0 ? "ring-1 ring-teal-200" : ""
                  )}
                >
                  <div className="text-xs font-medium text-slate-500">{format(date, "EEE")}</div>
                  <div className={cn("text-lg font-bold", isToday ? "text-teal-700" : "text-slate-900")}>
                    {format(date, "d")}
                  </div>
                  {dayAppts.length > 0 && (
                    <div className="mt-1 text-[10px] font-semibold text-teal-600">
                      {dayAppts.length} appt{dayAppts.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        {/* Appointments list */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((apt) => {
              const cfg = statusConfig[apt.status];
              const StatusIcon = cfg.icon;
              const doctor = doctors.find((d) => d.id === apt.doctorId);
              const isPast = new Date(apt.date) < new Date();
              const canReschedule = apt.status === "scheduled" && !isPast;
              const canCancel = apt.status === "scheduled" && !isPast;

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={doctor?.image}
                        alt={apt.doctorName}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{apt.doctorName}</div>
                        <div className="flex items-center gap-1 text-xs text-teal-700">
                          <Stethoscope size={12} />
                          {apt.specialty}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} className="text-teal-600" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-teal-600" />
                            {apt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-teal-600" />
                            Main Hospital
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User size={12} /> {apt.patientName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {apt.patientPhone}
                          </span>
                        </div>
                        {apt.notes && (
                          <div className="mt-2 flex items-start gap-1 text-xs text-slate-500">
                            <AlertCircle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                            <span className="line-clamp-2">{apt.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          cfg.color
                        )}
                      >
                        <StatusIcon size={12} />
                        {apt.status}
                      </span>

                      <div className="flex items-center gap-2">
                        {canReschedule && (
                          <button
                            onClick={() => {
                              setSelectedApt(apt);
                              setRescheduleDate(null);
                              setRescheduleTime(null);
                              setRescheduleReason("");
                              setShowReschedule(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            <RefreshCw size={12} />
                            Reschedule
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => {
                              setCancelConfirm(apt.id);
                              setCancelReason("");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setShowDetail(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          <FileText size={12} />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cancel confirmation inline */}
                  <AnimatePresence>
                    {cancelConfirm === apt.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="text-sm font-semibold text-red-800">
                            Cancel this appointment?
                          </div>
                          <p className="mt-1 text-xs text-red-600">
                            This action cannot be undone. Please provide a reason.
                          </p>
                          <input
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation..."
                            className="mt-3 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400"
                          />
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => handleCancel(apt.id)}
                              disabled={!cancelReason.trim()}
                              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm Cancel
                            </button>
                            <button
                              onClick={() => {
                                setCancelConfirm(null);
                                setCancelReason("");
                              }}
                              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50"
                            >
                              Keep Appointment
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <CalendarDays size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">No appointments found.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedApt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={doctors.find((d) => d.id === selectedApt.doctorId)?.image}
                    alt={selectedApt.doctorName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{selectedApt.doctorName}</div>
                    <div className="text-xs text-teal-600">{selectedApt.specialty}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-teal-600" />
                    <span className="text-slate-600">{selectedApt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-teal-600" />
                    <span className="text-slate-600">{selectedApt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-teal-600" />
                    <span className="text-slate-600">{selectedApt.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-teal-600" />
                    <span className="text-slate-600">{selectedApt.patientEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-teal-600" />
                    <span className="text-slate-600">{selectedApt.patientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-teal-600" />
                    <span className="text-slate-600">Main Hospital, Room 302</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Status:</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase",
                      statusConfig[selectedApt.status].color
                    )}
                  >
                    {selectedApt.status}
                  </span>
                </div>

                {selectedApt.notes && (
                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                    <div className="font-semibold mb-1">Notes</div>
                    {selectedApt.notes}
                  </div>
                )}

                <div className="text-xs text-slate-400">
                  Booked on {format(parseISO(selectedApt.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showReschedule && selectedApt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowReschedule(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Reschedule Appointment</h3>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Rescheduling {selectedApt.doctorName} — {selectedApt.specialty}
              </p>

              <div className="mt-5">
                <div className="text-sm font-medium text-slate-700">Select a new date</div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const available = getAvailableTimes(selectedApt.doctorId, date).length > 0;
                    const selected = rescheduleDate ? isSameDay(date, rescheduleDate) : false;
                    return (
                      <button
                        key={date.toISOString()}
                        disabled={!available}
                        onClick={() => {
                          setRescheduleDate(date);
                          setRescheduleTime(null);
                        }}
                        className={cn(
                          "flex flex-col items-center rounded-xl border py-2 text-xs transition-all",
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

              {rescheduleDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5"
                >
                  <div className="text-sm font-medium text-slate-700">Available times</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getAvailableTimes(selectedApt.doctorId, rescheduleDate).map((t) => (
                      <button
                        key={t}
                        onClick={() => setRescheduleTime(t)}
                        className={cn(
                          "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                          rescheduleTime === t
                            ? "border-teal-500 bg-teal-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mt-5">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Reason (optional)
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Why are you rescheduling?"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowReschedule(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReschedule(selectedApt)}
                  disabled={!rescheduleDate || !rescheduleTime}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  Confirm Reschedule
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
