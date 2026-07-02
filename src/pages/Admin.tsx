import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  AlertCircle,
  FileText,
  LogOut,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { supabase, type Appointment, type Doctor, type Patient } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";

type Tab = "dashboard" | "appointments" | "patients" | "doctors" | "reports";

type AppointmentWithDoctor = Appointment & { doctor?: Doctor };

export default function Admin() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const { data: patientsData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id);
      const { data: doctorsData } = await supabase
        .from("doctors")
        .select("*")
        .order("name");

      if (appointmentsData && doctorsData) {
        const appointmentWithDoctors = appointmentsData.map((apt) => ({
          ...apt,
          doctor: doctorsData.find((d) => d.id === apt.doctor_id),
        }));
        setAppointments(appointmentWithDoctors);
      }
      if (patientsData) setPatients(patientsData);
      if (doctorsData) setDoctors(doctorsData);
      setLoading(false);
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const matchesSearch =
          a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
          "";
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [search, statusFilter, appointments]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter((a) => a.status === "scheduled").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    return { total, scheduled, completed, cancelled };
  }, [appointments]);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      if (a.status !== "cancelled") {
        counts[a.date] = (counts[a.date] || 0) + 1;
      }
    });
    return counts;
  }, [appointments]);

  const statusColor: Record<string, string> = {
    scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    rescheduled: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const statusIcon: Record<string, React.ReactNode> = {
    scheduled: <Clock size={14} />,
    completed: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />,
    rescheduled: <RefreshCw size={14} />,
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "appointments", label: "Appointments", icon: CalendarDays },
    { key: "patients", label: "Profile", icon: Users },
    { key: "doctors", label: "Doctors", icon: Stethoscope },
    { key: "reports", label: "Reports", icon: BarChart3 },
  ];

  async function handleStatusUpdate(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a))
    );
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        {/* Sidebar */}
        <aside className="lg:w-64">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Dashboard
            </div>
            <nav className="space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setSearch(""); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {tab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Overview of your appointments.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Total Appointments", value: stats.total, icon: CalendarCheck, change: "+12%", up: true },
                    { label: "Scheduled", value: stats.scheduled, icon: Clock, change: "+5%", up: true },
                    { label: "Completed", value: stats.completed, icon: CheckCircle, change: "+8%", up: true },
                    { label: "Cancelled", value: stats.cancelled, icon: XCircle, change: "-2%", up: false },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-slate-500">{card.label}</div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                            <Icon size={16} />
                          </div>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-900">{card.value}</div>
                        <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", card.up ? "text-emerald-600" : "text-red-600")}>
                          {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {card.change} from last month
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Recent Appointments</h3>
                    <div className="mt-4 space-y-3">
                      {appointments.slice(0, 5).map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{a.doctor?.name}</div>
                            <div className="text-xs text-slate-500">{a.doctor?.specialty} / {a.date}</div>
                          </div>
                          <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusColor[a.status])}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <div className="text-sm text-slate-400 text-center py-4">
                          No appointments yet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Doctors Overview</h3>
                    <div className="mt-4 space-y-3">
                      {doctors.slice(0, 5).map((d) => {
                        const count = appointments.filter((a) => a.doctor_id === d.id && a.status !== "cancelled").length;
                        return (
                          <div key={d.id} className="flex items-center gap-3">
                            <img src={d.image} alt={d.name} className="h-9 w-9 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">{d.name}</div>
                              <div className="text-xs text-slate-500">{d.specialty}</div>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{count} appts</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "appointments" && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                <p className="text-sm text-slate-500">Manage and track all your appointments.</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by doctor..."
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

                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Doctor</th>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{a.doctor?.name}</div>
                              <div className="text-xs text-slate-400">{a.doctor?.specialty}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{a.patient_name}</div>
                              <div className="text-xs text-slate-400">{a.patient_email}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{a.date}</td>
                            <td className="px-4 py-3 text-slate-600">{a.time}</td>
                            <td className="px-4 py-3">
                              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusColor[a.status])}>
                                {statusIcon[a.status]}
                                {a.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {a.status === "scheduled" && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(a.id, "completed")}
                                      className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(a.id, "cancelled")}
                                      className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredAppointments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                              No appointments found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "patients" && (
              <motion.div
                key="patients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
                <p className="text-sm text-slate-500">Your patient information.</p>

                <div className="mt-6 space-y-4">
                  {patients.map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                          {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.full_name}</div>
                          <div className="text-xs text-slate-500">Registered on {format(new Date(p.created_at), "MMMM d, yyyy")}</div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="text-sm">
                          <span className="text-slate-500">Phone:</span>{" "}
                          <span className="text-slate-900">{p.phone}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Date of Birth:</span>{" "}
                          <span className="text-slate-900">{p.date_of_birth}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Gender:</span>{" "}
                          <span className="text-slate-900">{p.gender}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Emergency Contact:</span>{" "}
                          <span className="text-slate-900">{p.emergency_contact}</span>
                        </div>
                        <div className="text-sm sm:col-span-2">
                          <span className="text-slate-500">Address:</span>{" "}
                          <span className="text-slate-900">{p.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                      No profile information found. Complete registration to see your profile.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "doctors" && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
                <p className="text-sm text-slate-500">Available healthcare providers.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d) => {
                    const appts = appointments.filter((a) => a.doctor_id === d.id);
                    return (
                      <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={d.image} alt={d.name} className="h-12 w-12 rounded-full object-cover" />
                          <div>
                            <div className="font-semibold text-slate-900">{d.name}</div>
                            <div className="text-xs text-teal-600 font-medium">{d.specialty}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Days</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {d.available_days.map((day) => (
                              <span key={day} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hours</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {d.available_hours.map((h) => (
                              <span key={h} className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>{appts.filter((a) => a.status === "scheduled").length} upcoming</span>
                          <span>{appts.filter((a) => a.status === "completed").length} completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {tab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-sm text-slate-500">Your appointment analytics.</p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-semibold text-slate-900">{format(selectedMonth, "MMMM yyyy")}</span>
                  <button
                    onClick={() => setSelectedMonth((m) => startOfMonth(addMonths(m, 1)))}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Appointment Calendar</h3>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <div key={d} className="py-1 font-semibold">{d}</div>
                      ))}
                      {monthDays.map((day) => {
                        const count = dailyCounts[format(day, "yyyy-MM-dd")] || 0;
                        return (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              "rounded-lg py-2 text-sm font-medium",
                              count > 0 ? "bg-teal-50 text-teal-700" : "text-slate-400"
                            )}
                          >
                            {format(day, "d")}
                            {count > 0 && (
                              <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Status Breakdown</h3>
                    <div className="mt-4 space-y-4">
                      {[
                        { label: "Scheduled", value: stats.scheduled, color: "bg-amber-500" },
                        { label: "Completed", value: stats.completed, color: "bg-emerald-500" },
                        { label: "Cancelled", value: stats.cancelled, color: "bg-red-500" },
                      ].map((s) => {
                        const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0;
                        return (
                          <div key={s.label}>
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>{s.label}</span>
                              <span className="font-semibold">{s.value} ({pct}%)</span>
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                              <div
                                className={cn("h-2 rounded-full transition-all", s.color)}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">Summary Report</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="mt-0.5 text-teal-600" />
                      <span>Total appointments: <strong>{stats.total}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 text-amber-600" />
                      <span>Currently scheduled: <strong>{stats.scheduled}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle size={16} className="mt-0.5 text-emerald-600" />
                      <span>Successfully completed: <strong>{stats.completed}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle size={16} className="mt-0.5 text-red-600" />
                      <span>Cancelled appointments: <strong>{stats.cancelled}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="mt-0.5 text-teal-600" />
                      <span>Profile records: <strong>{patients.length}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Stethoscope size={16} className="mt-0.5 text-teal-600" />
                      <span>Available doctors: <strong>{doctors.length}</strong></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
