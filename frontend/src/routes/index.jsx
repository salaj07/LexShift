/**
 * @file src/routes/index.jsx
 * @description Centralized route definitions for LexShift.
 *
 * Uses 'createBrowserRouter' for v6+ performance and clean data-fetching.
 * Auth pages are nested under AuthLayout (no Navbar, no Footer).
 */

import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../features/home/Home';

// Auth feature
import AuthLayout from '../features/auth/AuthLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import VerifyOtpPage from '../features/auth/VerifyOtpPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';

const router = createBrowserRouter([
  // ─── Main App (with Navbar) ────────────────────────────────────
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },

  // ─── Auth Pages (no Navbar, dark glass layout) ─────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify-otp', element: <VerifyOtpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
]);

export default router;
