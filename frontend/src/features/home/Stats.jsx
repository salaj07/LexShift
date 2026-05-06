/**
 * @file src/features/home/Stats.jsx
 * @description Platform Stats Section for LexShift.
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Stats = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = Array.from(container.children);

      // Initial hidden state

      gsap.set(cards, {
        opacity: 0,
        y: 80,
        scale: 0.8,
      });

      ScrollTrigger.create({
        trigger: container,
        start: "top 85%",
        end: "top 60%",
        markers: false,
        
        // SCROLL DOWN

        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.2,
            ease: "bounce.in",
          });
        },

        // SCROLL BACK UP

        onLeaveBack: () => {
          gsap.to(cards, {
            opacity: 0,
            y: -100,
            scale: 0.7,
            stagger: 0.1,
            ease: "bounce.in",
          });
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  const stats = [
    {
      label: "IPC SECTIONS MAPPED",
      value: "100%",
      sub: "Full BNS Correlation",
    },
    {
      label: "PRECEDENT ACCURACY",
      value: "99.9%",
      sub: "Context-Aware NLP",
    },
    {
      label: "DAILY CASE ANALYSIS",
      value: "24/7",
      sub: "Global Edge Sync",
    },
  ];

  return (
    <section className="relative z-10 w-full py-10 px-8 md:px-16 lg:px-24 bg-background border-t border-white/5">
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl mx-auto"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass p-16 flex flex-col items-center text-center z-50 space-y-8 border border-white/5 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden"
          >
            {/* Main Content */}
            <div className="space-y-4 relative z-10">
              <h3 className="font-rubik text-6xl md:text-8xl font-black text-white group-hover:text-primary transition-colors leading-none tracking-tighter">
                {stat.value}
              </h3>

              <div className="flex flex-col space-y-2">
                <span className="font-rubik text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/20 group-hover:text-white/40 transition-colors">
                  {stat.label}
                </span>

                <div className="w-8 h-px bg-primary/20 mx-auto" />

                <span className="text-[9px] font-inter font-bold text-primary uppercase tracking-widest">
                  {stat.sub}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-primary w-[95%] group-hover:w-full transition-all duration-1000 ease-out" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;





