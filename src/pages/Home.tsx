import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  Users,
  BarChart3,
  Bell,
  ArrowRight,
  Stethoscope,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    desc: "Book appointments with your preferred doctor in just a few clicks, 24/7.",
  },
  {
    icon: Clock,
    title: "Reduce Wait Times",
    desc: "Optimized scheduling ensures minimal waiting and efficient care delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Records",
    desc: "Your health information is handled with the highest privacy standards.",
  },
  {
    icon: Users,
    title: "Doctor Profiles",
    desc: "Browse specialties, availability, and choose the right provider for you.",
  },
  {
    icon: BarChart3,
    title: "Admin Reports",
    desc: "Powerful dashboards and reports for healthcare management decisions.",
  },
  {
    icon: Bell,
    title: "Stay Informed",
    desc: "Receive confirmations, reminders, and updates about your appointments.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 to-slate-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Stethoscope size={32} className="text-teal-200" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Patient Appointment
              <br />
              <span className="text-teal-300">Scheduling System</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
              A modern, intuitive platform that connects patients with healthcare
              providers. Book, reschedule, and manage appointments effortlessly.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow-lg transition-transform hover:scale-105"
              >
                Book Appointment
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Register as Patient
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {[
            { label: "Doctors", value: "12+" },
            { label: "Daily Appointments", value: "200+" },
            { label: "Patients Served", value: "5,000+" },
            { label: "Satisfaction Rate", value: "98%" },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl font-bold text-teal-700">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Why Choose MedSchedule?
            </h2>
            <p className="mt-3 text-slate-500">
              Built for patients, doctors, and administrators alike.
            </p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-slate-800 to-teal-800 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to streamline your healthcare experience?
          </h2>
          <p className="mt-3 text-slate-200">
            Join thousands of patients and providers already using MedSchedule.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow-lg transition-transform hover:scale-105"
            >
              Book Now
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-400">
          MedSchedule &copy; {new Date().getFullYear()} — Patient Appointment Scheduling System.
        </div>
      </footer>
    </div>
  );
}
