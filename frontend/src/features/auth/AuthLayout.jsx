/**
 * @file src/features/auth/AuthLayout.jsx
 * @description Shared layout wrapper for all auth pages.
 *
 * Provides the dark themed glass container with ambient glow orbs
 * matching the LexShift brand: deep indigo + cyan.
 */

import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex items-center justify-center">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[100px] pointer-events-none" />

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      {/* Brand Top-Left */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-3 z-10 group"
      >
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <span className="font-rubik text-white font-black text-xl">L</span>
        </div>
        <span className="font-rubik uppercase font-bold text-white tracking-widest text-lg group-hover:text-primary transition-colors">
          LexShift
        </span>
      </Link>

      {/* Auth Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
