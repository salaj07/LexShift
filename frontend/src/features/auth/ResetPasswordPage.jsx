/**
 * @file src/features/auth/ResetPasswordPage.jsx
 * @description Reset password using OTP from email.
 * Reads ?email= from URL. Submits OTP + new password.
 */

import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from './api/authApi';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputRefs = useRef([]);

  const handleOtpChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    paste.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) return setError('Enter the full 6-digit OTP.');
    if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await resetPassword({ email, otp: otpString, newPassword });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
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
          Reset Password
        </p>
        <h1 className="font-rubik text-3xl font-black uppercase text-white leading-tight">
          New Password
        </h1>
        <p className="font-inter text-sm text-white/40 leading-relaxed">
          Enter the OTP sent to{' '}
          <span className="text-white/70 font-medium">{email || 'your email'}</span>{' '}
          and set a new password.
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

        <form onSubmit={handleSubmit} id="reset-password-form" className="space-y-6">
          {/* OTP Boxes */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Reset OTP
            </label>
            <div className="flex gap-2 justify-start" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`reset-otp-digit-${i}`}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`
                    w-11 h-13 text-center font-rubik text-lg font-black text-white
                    bg-white/5 border rounded-xl outline-none transition-all
                    ${digit ? 'border-primary bg-primary/10' : 'border-white/10'}
                    focus:border-primary focus:bg-primary/5
                  `}
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              New Password
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Lock className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="reset-new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                placeholder="Min. 6 characters"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="text-white/20 hover:text-white/60 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block font-rubik text-[9px] font-black uppercase tracking-widest text-white/40">
              Confirm New Password
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-primary/50 transition-colors">
              <Lock className="w-4 h-4 text-white/20 shrink-0" />
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Repeat new password"
                className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-white/20 outline-none"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-white/20 hover:text-white/60 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="reset-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Reset Password
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

export default ResetPasswordPage;
