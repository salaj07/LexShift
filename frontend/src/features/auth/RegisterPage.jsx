/**
 * @file src/features/auth/RegisterPage.jsx
 * @description Registration page for LexShift.
 *
 * Collects: username, email, password, confirm password.
 * On success: redirects to /verify-otp?email=...
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from './api/authApi';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      return setError('All fields are required.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate(`/verify-otp?email=${encodeURIComponent(res.data.email)}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="font-rubik text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          Create Account
        </p>
        <h1 className="font-rubik text-3xl font-black uppercase text-white leading-tight">
          Join LexShift
        </h1>
        <p className="font-inter text-sm text-white/40">
          AI-powered legal document conversion starts here.
        </p>
      </div>

      {/* Glass Card */}
      <div className="glass rounded-2xl p-8 space-y-6 border-white/10">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="font-inter text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
          {/* Username */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Username
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <User className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="register-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. adv_sharma"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Mail className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Password
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Lock className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Confirm Password
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Lock className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-inter text-[10px] text-white/20 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google OAuth */}
        <a
          href="http://localhost:3000/auth/google"
          id="google-register-btn"
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-inter font-semibold text-sm py-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </a>
      </div>

      {/* Footer Link */}
      <p className="mt-8 text-center font-inter text-sm text-white/30">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
