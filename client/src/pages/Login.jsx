import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-slate-100">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-violet-500 text-2xl font-black text-white shadow-glow">
            A
          </div>
          <h1 className="text-3xl font-extrabold text-white">AlignLab</h1>
          <p className="mt-2 text-sm text-slate-400">Human preference data and LLM evaluation workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-6">
          <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="username">
            Username
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3">
            <UserRound className="h-5 w-5 text-slate-500" />
            <input
              id="username"
              className="focus-ring w-full bg-transparent py-3 text-white placeholder:text-slate-600"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              autoComplete="username"
              required
            />
          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="password">
            Password
          </label>
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3">
            <LockKeyhole className="h-5 w-5 text-slate-500" />
            <input
              id="password"
              type="password"
              className="focus-ring w-full bg-transparent py-3 text-white placeholder:text-slate-600"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-3 font-bold text-white hover:bg-violet-400"
          >
            <LogIn className="h-5 w-5" />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-5 grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-black/15 p-3 text-xs text-slate-400 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-md bg-white/[0.04] px-3 py-2 text-left hover:bg-white/[0.07]"
              onClick={() => setForm({ username: "admin", password: "admin123" })}
            >
              admin / admin123
            </button>
            <button
              type="button"
              className="rounded-md bg-white/[0.04] px-3 py-2 text-left hover:bg-white/[0.07]"
              onClick={() => setForm({ username: "annotator", password: "annotator123" })}
            >
              annotator / annotator123
            </button>
          </div>
        </form>
      </motion.section>
    </main>
  );
}
