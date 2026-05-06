require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('./services/passport.service');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const documentUpload = require('./routes/doc.routes');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

app.use(helmet({
  // Allow cross-origin requests — needed for socket.io (frontend:5173 → backend:3000)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  // Disable default CSP in dev — configure per-environment for production
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(compression());   // gzip all responses
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(globalLimiter);

app.use('/auth', authRoutes);
app.use('/docs', documentUpload);




module.exports = app;