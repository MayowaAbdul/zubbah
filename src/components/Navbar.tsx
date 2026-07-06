import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  CalendarDays,
  List,
  UserPlus,
  LogIn,
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const publicNavLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Doctors", href: "/doctors", icon: Users },
    { label: "Register", href: "/register", icon: UserPlus },
    { label: "Login", href: "/login", icon: LogIn },
  ];

  const authNavLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Book", href: "/book", icon: CalendarDays },
    { label: "Appointments", href: "/appointments", icon: List },
    { label: "Doctors", href: "/doctors", icon: Users },
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  async function handleSignOut() {
    await signOut();
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Stethoscope size={20} />
          </div>
          <span className="text-lg font-bold text-slate-900">
            ZUBBAH
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-50 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col px-4 py-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
