/**
 * @file src/features/home/PrivacyFocus.jsx
 * @description Privacy and Security Focus for LexShift.
 
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, EyeOff, Trash2, Zap } from 'lucide-react';

const PrivacyFocus = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".privacy-card", {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        once: true,
      }
    });

  }, []);

  const points = [
    {
      title: "LOCAL PII SCRUBBING",
      desc: "Client names, locations, and sensitive case details are masked locally before AI processing.",
      icon: <EyeOff className="w-6 h-6 text-primary" />,
    },
    {
      title: "EPHEMERAL PROCESSING",
      desc: "All converted documents are auto-deleted from our temporary vault immediately after download.",
      icon: <Trash2 className="w-6 h-6 text-secondary" />,
    },
    {
      title: "95% ACCURACY",
      desc: "Statutory mapping is validated against official IPC-BNS frameworks with context awareness.",
      icon: <Zap className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section ref={containerRef} className="relative w-full py-24 px-8 md:px-16 lg:px-24 bg-background border-t border-white/5">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 bg-grid opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-32 relative z-10 w-full">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-2xl w-full">
          <span className="font-rubik text-[10px] font-black uppercase tracking-[1em] text-primary">
            SECURITY STANDARDS
          </span>
          <h2 className="font-rubik text-5xl md:text-7xl font-black uppercase text-white leading-tight">
            Privacy First <br /> Architecture.
          </h2>
          <p className="font-inter text-base text-onSurface/40 leading-relaxed">
            LexShift is engineered to be a **non-custodial system**—we convert your data without ever 'owning' it or exposing it to 3rd party AI unmasked.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full">

          {/* Left: Feature Grid (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {points.map((p, i) => (
              <div key={i} className="privacy-card glass p-10 flex flex-col justify-between space-y-10 group hover:border-primary/50 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-2xl">
                  {p.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="font-rubik text-2xl font-black text-white tracking-widest">
                    {p.title}
                  </h3>
                  <div className="w-8 h-px bg-primary" />
                  <p className="font-inter text-[13px] text-onSurface/40 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Technical Reveal (5 Cols - Filling Empty Space) */}
          <div className="lg:col-span-5">
            <div className="privacy-card glass p-12 border-primary/20 bg-primary/5 space-y-12 h-full flex flex-col justify-between">
              <h4 className="font-rubik text-xs font-black uppercase tracking-[0.4em] text-primary">
                PII Tokenization Protocol
              </h4>

              <div className="space-y-8 flex-1 flex flex-col justify-center">
                <div className="space-y-3">
                  <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">Input:</span>
                  <div className="text-[14px] text-white/60 font-mono bg-white/5 p-4 rounded border border-white/5">
                    CLIENT NAME: RAHUL SHARMA <br />
                    LOCATION: PUNE, MAHARASHTRA
                  </div>
                </div>

                <div className="flex justify-center h-12">
                  <div className="w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">Scrubbed Aggregate:</span>
                  <div className="text-[14px] text-primary font-mono font-black border border-primary/50 p-4 rounded bg-primary/10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                    CLIENT: [PERSON_1] <br />
                    LOCATION: [LOCATION_1]
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black font-rubik text-white uppercase tracking-widest leading-none">AES-256 Vault Initialized</span>
                  <span className="block text-[9px] font-inter text-onSurface/30">Zero-Retention ephemeral storage active.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PrivacyFocus;
