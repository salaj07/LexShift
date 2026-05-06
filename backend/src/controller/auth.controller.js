const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendOTP } = require('../services/email.service');
const logger = require('../utils/logger');

// 🔹 Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//////////////////////////////////////////////////////////////////
// *      1. MANUAL REGISTER
//////////////////////////////////////////////////////////////////

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false
    });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();
    try {
      await sendOTP(user.email, otp);
    } catch (err) {
      logger.warn(`OTP email delivery failed for ${user.email}: ${err.message}`);
    }

    res.status(201).json({
      message: 'User registered. Please verify OTP',
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ error: 'Server otp error' });
  }
}

//////////////////////////////////////////////////////////////////
// *      2. MANUAL LOGIN
//////////////////////////////////////////////////////////////////

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Please login with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify OTP first' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server otp error' });
  }
}

//////////////////////////////////////////////////////////////////
// *      3. GOOGLE CALLBACK (SEND OTP)
//////////////////////////////////////////////////////////////////

async function googleAuthCallback(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const user = req.user;

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.isVerified = false;

    await user.save();

    try {
      await sendOTP(user.email, otp);
    } catch (err) {
      logger.warn(`OTP email delivery failed for ${user.email}: ${err.message}`);
    }

    res.redirect(`http://localhost:5173/verify-otp?email=${user.email}`);

  } catch (error) {
    res.status(500).json({ error: 'Server google auth error' });
  }
}

//////////////////////////////////////////////////////////////////
// *      4. VERIFY OTP (Login after verification)
//////////////////////////////////////////////////////////////////

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ error: 'OTP not found or already used' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message: 'OTP verified. Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server otp verification  error' });
  }
}

//////////////////////////////////////////////////////////////////
// *      5. FORGOT PASSWORD (SEND OTP)
//////////////////////////////////////////////////////////////////

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Use Google login' });
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    try {
      await sendOTP(user.email, otp);
    } catch (err) {
      logger.warn(`OTP email delivery failed for ${user.email}: ${err.message}`);
    }
    res.json({
      message: 'Reset OTP sent to email'
    });

  } catch (error) {
    res.status(500).json({ error: 'Server forget pass error' });
  }
}

//////////////////////////////////////////////////////////////////
//*      6. RESET PASSWORD
//////////////////////////////////////////////////////////////////

async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ error: 'OTP not found' });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    res.status(500).json({ error: 'Server reset pass error' });
  }
}

//////////////////////////////////////////////////////////////////
// *      7. GET ME (Verify cookie session)
//////////////////////////////////////////////////////////////////

async function getMe(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -otp -otpExpiry -resetOtp -resetOtpExpiry');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      }
    });

  } catch (error) {
    // Token expired or invalid
    res.status(401).json({ error: 'Session expired. Please login again.' });
  }
}

//* ////////////////////////////////////////////////////////////////
// *      8. LOGOUT (Clear cookie)
//* ////////////////////////////////////////////////////////////////

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.json({ message: 'Logged out successfully' });
}

//////////////////////////////////////////////////////////////////

module.exports = {
  register,
  login,
  googleAuthCallback,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
  logout
};