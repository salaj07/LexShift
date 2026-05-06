/**
 * @file src/middlewares/rateLimiter.middleware.js
 * @description Rate limiters for different route groups.
 *
 * Why different limits per group:
 *  - Global API     → catch general abuse / scrapers
 *  - Auth routes    → prevent brute-force login attacks
 *  - OTP routes     → prevent OTP enumeration / spam
 *  - Upload routes  → prevent abuse of expensive AI processing jobs
 */

const rateLimit = require('express-rate-limit');

// ─── 1. GLOBAL API LIMITER ────────────────────────────────────────────────────
// Applied to all routes — catches general API abuse
// Allows 100 requests per IP every 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,    // return RateLimit-* headers in response
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ─── 2. AUTH LIMITER ─────────────────────────────────────────────────────────
// Applied to login & register — prevents brute-force attacks
// Allows 10 attempts per IP every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// ─── 3. OTP LIMITER ──────────────────────────────────────────────────────────
// Strictest — prevents OTP spam & email bombing
// Allows only 5 OTP requests per IP every 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
  },
});

// ─── 4. UPLOAD LIMITER ───────────────────────────────────────────────────────
// Applied to document upload — each upload triggers expensive AI + Puppeteer job
// Allows 10 uploads per IP per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Upload limit reached. You can upload up to 10 documents per hour.',
  },
});

module.exports = { globalLimiter, authLimiter, otpLimiter, uploadLimiter };
