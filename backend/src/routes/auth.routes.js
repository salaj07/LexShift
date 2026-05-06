//* auth.routes.js

const express = require('express');
const passport = require('../services/passport.service');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter.middleware');

const {
  register,
  login,
  googleAuthCallback,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} = require('../controller/auth.controller');

const router = express.Router();

//////////////////////////////////////////////////////////////////
// 🔹 MANUAL AUTH
//////////////////////////////////////////////////////////////////

//* register user — limit to 10 req/15min to prevent spam accounts
router.post('/register', authLimiter, register);

//* login user — limit to 10 req/15min to prevent brute-force
router.post('/login', authLimiter, login);

//////////////////////////////////////////////////////////////////
// 🔹 GOOGLE AUTH
//////////////////////////////////////////////////////////////////

//* start google login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

//* google callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuthCallback
);

//////////////////////////////////////////////////////////////////
// 🔹 OTP
//////////////////////////////////////////////////////////////////

//* verify OTP — limit to 5 req/15min to prevent enumeration
router.post('/verify-otp', otpLimiter, verifyOTP);

//////////////////////////////////////////////////////////////////
// 🔹 FORGOT PASSWORD
//////////////////////////////////////////////////////////////////

//* send reset OTP — limit to 5 req/15min to prevent email bombing
router.post('/forgot-password', otpLimiter, forgotPassword);

//* reset password — limit to 5 req/15min
router.post('/reset-password', otpLimiter, resetPassword);

//////////////////////////////////////////////////////////////////
// 🔹 SESSION
//////////////////////////////////////////////////////////////////

//* verify cookie session + return user
router.get('/me', getMe);

//* logout — clears httpOnly cookie
router.post('/logout', logout);

//////////////////////////////////////////////////////////////////

module.exports = router;