import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../services/auth/authService.js";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password || password.length === 0) return "Password is required";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors.server) setErrors((prev) => ({ ...prev, server: "" }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    setLoading(true);
    try {
      await login(form);
      navigate("/app");
    } catch (err) {
      const serverError = err.response?.data?.message || "Login failed. Please try again.";
      setErrors((prev) => ({ ...prev, server: serverError }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Ambient floating orbs */}
      <div className="floating-orb floating-orb-dream w-72 h-72 -top-10 -right-16" />
      <div className="floating-orb floating-orb-love w-80 h-80 bottom-0 -left-20" style={{ animationDelay: "3s" }} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="card-glass glass-strong space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              className="text-4xl mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            >
              💌
            </motion.div>
            <h1 className="text-h1 gradient-text-mixed">Welcome back</h1>
            <p className="text-caption">Your space has been waiting for you.</p>
          </div>

          {sessionExpired && (
            <motion.div
              className="glass rounded-lg px-4 py-3 border border-[var(--status-warning)]/30 bg-[var(--status-warning)]/10"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[var(--status-warning)] text-sm">
                Your session expired — please sign in again.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="stack-md" noValidate>
            {/* Email */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`input-field ${touched.email && errors.email ? "input-error" : ""}`}
              />
              {touched.email && errors.email && (
                <p id="email-error" className="text-[var(--status-error)] text-xs mt-1.5" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.password && !!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`input-field ${touched.password && errors.password ? "input-error" : ""}`}
              />
              {touched.password && errors.password && (
                <p id="password-error" className="text-[var(--status-error)] text-xs mt-1.5" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Server error */}
            {errors.server && (
              <motion.div
                className="glass rounded-lg px-4 py-3 border border-[var(--status-error)]/30 bg-[var(--status-error)]/10"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-[var(--status-error)] text-sm" role="alert">{errors.server}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-base"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
            >
              {loading ? (
                <span className="hstack-sm">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

          <p className="text-center text-caption">
            No account?{" "}
            <Link to="/signup" className="text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-light)] font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
