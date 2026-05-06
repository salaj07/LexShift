/**
 * @file src/features/auth/ForgotPasswordPage.jsx
 * @description Forgot password — sends reset OTP to email.
 * On success: redirects to /reset-password?email=...
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from './api/authApi';
import { Mail, ArrowRight, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) return setError('Email is required.');

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess('Reset OTP sent! Redirecting...');
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <p className="font-rubik text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          Password Recovery
        </p>
        <h1 className="font-rubik text-3xl font-black uppercase text-white leading-tight">
          Forgot Password
        </h1>
        <p className="font-inter text-sm text-white/40 leading-relaxed">
          Enter your registered email and we&apos;ll send a reset OTP valid for 5 minutes.
        </p>
      </div>

      {/* Glass Card */}
      <div className="glass rounded-2xl p-8 space-y-6 border-white/10">
        {/* Error / Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="font-inter text-xs text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <p className="font-inter text-xs text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} id="forgot-password-form" className="space-y-5">
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Mail className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          <button
            id="forgot-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send Reset OTP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Back */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-inter text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
