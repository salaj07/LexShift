/**
 * @file src/components/ui/Navbar.jsx
 * @description Advanced Shifting Navbar for LexShift.
 *
 * Logic Highlights:
 * - Shrinks in width and height after initial scroll.
 * - Hides on scroll-down, reappears on scroll-up.
 * - Glassmorphism texture with Indigo ambient glow.
 * - Auth-aware: shows Login/Register when logged out, user chip + logout when logged in.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LogOut, UserCircle2 } from 'lucide-react';
import useAuthStore from '../../features/auth/store/authStore';

const Navbar = () => {
  const navRef = useRef(null);
  const [isShrunk, setIsShrunk] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    // 1. Initial GSAP Registration
    gsap.registerPlugin(ScrollTrigger);

    // 2. Scroll-Direction Hide/Show Logic
    const showNav = gsap.from(navRef.current, {
      yPercent: -130,
      paused: true,
      duration: 0.5,
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: 99999,
      onUpdate: (self) => {
        self.direction === -1 ? showNav.play() : showNav.reverse();

        if (self.scroll() > 50) {
          setIsShrunk(true);
        } else {
          setIsShrunk(false);
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 transition-all duration-500 ease-in-out border-b border-white/5
        ${isShrunk ? 'h-16 w-[70%] mx-auto mt-4 rounded-2xl glass shadow-2xl' : 'h-20 w-full bg-background/50'}`}
    >
      {/* Brand Identity */}
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="LexShift Logo" className="h-14 w-auto" />
        <span className={`font-rubik uppercase font-bold text-white tracking-widest transition-all duration-500 ${isShrunk ? 'text-lg' : 'text-2xl'}`}>
          LexShift
        </span>
      </Link>

      {/* Navigation Links — Desktop */}
      <ul className="hidden md:flex items-center gap-6 font-inter text-sm font-medium text-onSurface/70">
        <li className="hover:text-primary transition-colors cursor-pointer">Features</li>
        <li className="hover:text-primary transition-colors cursor-pointer">Process</li>
        <li className="hover:text-primary transition-colors cursor-pointer">Privacy</li>

        {/* Auth-aware Controls */}
        {isAuthenticated && user ? (
          <>
            {/* User Chip */}
            <li className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-white">
              <UserCircle2 className="w-4 h-4 text-primary" />
              <span className="font-inter text-sm text-white/80 font-medium max-w-[100px] truncate">
                {user.username}
              </span>
            </li>

            {/* Logout */}
            <li>
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/50 hover:text-red-400 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Login Button */}
            <li>
              <Link
                id="navbar-login-btn"
                to="/login"
                className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all font-medium text-sm"
              >
                Login
              </Link>
            </li>

            {/* Register Button */}
            <li>
              <Link
                id="navbar-register-btn"
                to="/register"
                className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/80 transition-all font-medium text-sm"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Mobile Toggle Placeholder */}
      <div className="md:hidden text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </div>
    </nav>
  );
};

export default Navbar;
