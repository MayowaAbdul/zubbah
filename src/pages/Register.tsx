import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle, Eye, EyeOff } from "lucide-react";
import { addPatient, patients } from "../data/mockData";
import { cn } from "../lib/utils";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    password: "",
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.emergencyContact.trim()) e.emergencyContact = "Emergency contact is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addPatient({
      id: `pat-${Date.now()}`,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      emergencyContact: form.emergencyContact,
      registeredAt: new Date().toISOString(),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <CheckCircle size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Registration Successful</h2>
          <p className="mt-2 text-sm text-slate-500">
            Welcome, {patients[patients.length - 1]?.fullName}. Your account has been created.
          </p>
        </motion.div>
      </div>
    );
  }

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 555-0000" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "" },
    { name: "address", label: "Address", type: "text", placeholder: "123 Main St, City" },
    { name: "emergencyContact", label: "Emergency Contact", type: "text", placeholder: "Name + Phone" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <UserPlus size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Patient Registration</h1>
              <p className="text-sm text-slate-500">Create your patient account to book appointments.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className={f.name === "address" || f.name === "emergencyContact" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.name]}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={cn(
                      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-teal-500/20",
                      errors[f.name] ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                    )}
                  />
                  {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name]}</p>}
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}
                  className={cn(
                    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-teal-500/20",
                    errors.gender ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                  )}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className={cn(
                      "w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-teal-500/20",
                      errors.password ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <UserPlus size={18} />
              Register Account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
