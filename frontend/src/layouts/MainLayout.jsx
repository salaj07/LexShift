/**
 * @file src/layouts/MainLayout.jsx
 * @description Master layout wrapper for the LexShift platform.
 * 
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';

const MainLayout = () => {
  return (
    <div className="relative min-h-screen bg-background text-onSurface selection:bg-primary selection:text-white">
      {/* Dynamic Navigation Component (z-100) */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="relative flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
