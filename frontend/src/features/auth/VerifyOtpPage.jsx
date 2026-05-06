/**
 * @file src/features/auth/VerifyOtpPage.jsx
 * @description OTP verification page for LexShift.
 *
 * Reads ?email= from URL query params.
 * 6 individual OTP input boxes with auto-advance + paste support.
 * 5-minute countdown timer matching backend OTP expiry.
 * On success: stores user in Zustand and redirects to home.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyOtp } from './api/authApi';
import useAuthStore from './store/authStore';
import { ShieldCheck, Loader2, ArrowLeft, RotateCcw } from 'lucide-react';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const setUser = useAuthStore((s) => s.setUser);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

  const inputRefs = useRef([]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Handle single digit input
  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[i] = value.slice(-1); // take last char
    setOtp(newOtp);
    setError('');

    if (value && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  // Backspace: go to previous input
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // Paste full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    paste.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      return setError('Enter the full 6-digit OTP.');
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp: otpString });
      setUser(res.data.user);
      setSuccess('Verified! Redirecting...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;
  const isComplete = otp.every((d) => d !== '');

  return (
    <div>
      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <p className="font-rubik text-[10px] font-black uppercase tracking-[0.4em] text-primary">
          Verification
        </p>
        <h1 className="font-rubik text-3xl font-black uppercase text-white leading-tight">
          Enter OTP
        </h1>
        <p className="font-inter text-sm text-white/40 leading-relaxed">
          A 6-digit code was sent to{' '}
          <span className="text-white/70 font-medium">{email || 'your email'}</span>.
          It expires in{' '}
          <span className={`font-bold ${isExpired ? 'text-red-400' : timeLeft < 60 ? 'text-orange-400' : 'text-primary'}`}>
            {isExpired ? 'expired' : formatTime(timeLeft)}
          </span>.
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

        <form onSubmit={handleSubmit} id="verify-otp-form" className="space-y-8">
          {/* OTP Boxes */}
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-digit-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isExpired}
                className={`
                  w-12 h-14 text-center font-rubik text-xl font-black text-white
                  bg-white/5 border rounded-xl outline-none transition-all
                  ${digit ? 'border-primary bg-primary/10' : 'border-white/10'}
                  focus:border-primary focus:bg-primary/5
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            id="verify-otp-submit"
            type="submit"
            disabled={loading || isExpired || !isComplete}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-inter font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify OTP
              </>
            )}
          </button>
        </form>

        {/* Expired notice */}
        {isExpired && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400 shrink-0" />
            <p className="font-inter text-xs text-orange-300">
              OTP has expired. Please{' '}
              <Link to="/register" className="underline text-orange-400">register again</Link>{' '}
              to get a new one.
            </p>
          </div>
        )}
      </div>

      {/* Back link */}
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

export default VerifyOtpPage;
