/**
 * @file src/features/home/Modules.jsx
 * @description Professional Modules Segment for LexShift.
 * 
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gavel, Scale, Briefcase, ChevronRight } from 'lucide-react';

const Modules = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".module-card", {
      opacity: 0,
      y: 50,
      duration: 1.2,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        once: true,
      }
    });

  }, []);

  const modules = [
    {
      title: "THE BAR",
      subtitle: "For Researchers & Litigators",
      icon: <Scale className="w-8 h-8 text-primary" />,
      features: [
        "Master the IPC ➔ BNS transition",
        "Context-sensitive case-law mapping",
        "Automated drafting support",
        "Precedent analysis engine"
      ],
      accent: "border-primary/20"
    },
    {
      title: "THE BENCH",
      subtitle: "For Judiciary Professionals",
      icon: <Gavel className="w-8 h-8 text-secondary" />,
      features: [
        "High-speed statutory mapping",
        "Massive case backlog management",
        "Statutory correlation verification",
        "Built-in judicial reference check"
      ],
      accent: "border-secondary/20"
    },
    {
      title: "THE FIRM",
      subtitle: "For Legal Organizations",
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      features: [
        "Enterprise-grade conversion APIs",
        "Batch document processing at scale",
        "Team collaboration workflows",
        "Audit-ready security logs"
      ],
      accent: "border-primary/20"
    },
  ];

  return (
    <section ref={containerRef} className="w-full min-h-screen py-24 px-8 md:px-16 lg:px-24 bg-background overflow-hidden relative flex items-center">
      <div className="absolute inset-0 z-0 bg-grid opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-32 relative z-10 w-full">

        {/* Section Header */}
        <div className="flex flex-col space-y-6 max-w-2xl">
          <span className="font-rubik text-[10px] font-black uppercase tracking-[1em] text-primary">
            AUTHORITY FOCUS
          </span>
          <h2 className="font-rubik text-5xl md:text-7xl font-black uppercase text-white leading-tight">
            Tailored For <br /> Authority.
          </h2>
          <p className="font-inter text-base text-onSurface/40 leading-relaxed max-w-lg">
            LexShift provides specialized toolsets for the three pillars of the legal community, engineered for high-stakes accuracy.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modules.map((m, i) => (
            <div key={i} className={`module-card glass p-12 flex flex-col justify-between space-y-16 group hover:bg-white/5 transition-all duration-500 border ${m.accent}`}>

              <div className="space-y-12">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    {m.icon}
                  </div>
                  <div className="text-right">
                    <span className="block font-rubik text-xs font-black text-primary opacity-40 uppercase tracking-widest">Version</span>
                    <span className="font-inter text-[10px] font-bold text-white/20">V1.2.0</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-rubik text-4xl font-black uppercase text-white tracking-widest group-hover:text-primary transition-colors">
                      {m.title}
                    </h3>
                    <p className="font-inter text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                      {m.subtitle}
                    </p>
                  </div>

                  <div className="w-full h-px bg-white/5" />

                  <ul className="space-y-4 pt-2">
                    {m.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-[13px] text-onSurface/40 font-medium font-inter leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-8 pt-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Reliability</span>
                    <span className="text-xs font-rubik font-black text-white">99.9%</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Uptime</span>
                    <span className="text-xs font-rubik font-black text-white">24/7</span>
                  </div>
                </div>

                <div className="flex items-center justify-between group/btn cursor-pointer">
                  <span className="text-[11px] font-rubik font-black uppercase tracking-widest text-white/40 group-hover:text-primary transition-colors">
                    Initialize Module
                  </span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-primary group-hover/btn:bg-primary transition-all">
                    <ChevronRight className="w-4 h-4 text-white group-hover/btn:-rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Modules;
