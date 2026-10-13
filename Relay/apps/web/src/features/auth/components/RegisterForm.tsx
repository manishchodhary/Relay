import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../lib/axios";
import { saveSession } from "../../../lib/session";

type AuthResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    accessToken?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      createdAt?: string;
    };
  };
};

function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 3) {
      setError("Your name must contain at least 3 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      const result = response.data;

      if (result.data?.accessToken && result.data.user) {
        saveSession(result.data.accessToken, result.data.user);
        navigate("/home", { replace: true });
        return;
      }
      setNotice("Your account was created successfully. You can now sign in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (cause) {
      if (axios.isAxiosError(cause)) {
        const status = cause.response?.status;
        const message =
          status && status < 500
            ? "Unable to create your account. Check your details and try again."
            : "Internal server error. Please try again later.";
        setError(message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
      <div>
        <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-slate-700">
          Full name
        </label>
        <div className="relative">
          <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={3}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">
          Email address
        </label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Enter your password again"
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p key="register-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </motion.p>
        )}
        {notice && (
          <motion.div key="register-notice" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p>{notice}</p>
            <Link to="/auth/login" className="inline-block font-semibold underline underline-offset-4">Go to sign in</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">
        {loading && <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />}
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-semibold text-sky-700 transition hover:text-sky-900">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
