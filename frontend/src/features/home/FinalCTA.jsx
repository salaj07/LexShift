/**
 * @file src/features/home/FinalCTA.jsx
 * @description High-Conversion Final Section for LexShift.
 * 
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FinalCTA = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".cta-content", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        once: true,
      }
    });

  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-30 bg-background flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background mb-[-1px]" />

      <div className="cta-content relative z-10 flex flex-col items-center text-center space-y-24 max-w-7xl px-8 w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center w-full text-left">
           <div className="space-y-8">
              <div className="w-16 h-1 bg-primary" />
              <h2 className="font-rubik text-5xl md:text-8xl font-black uppercase text-white leading-none tracking-tighter">
                Scale Your <br /> Reality.
              </h2>
              <p className="font-inter text-base md:text-lg text-onSurface/40 max-w-lg leading-relaxed">
                Stop mapping legacy laws manually. Launch your case into the next generation of legal intelligence today.
              </p>
              
              {/* CTA Button */}
              <div className="transition-transform hover:scale-105 active:scale-95 cursor-pointer inline-block">
                <svg width="260" height="90" viewBox="0 0 260 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H234L260 90H26L0 0Z" fill="white"/>
                  <text 
                    x="50%" 
                    y="55%" 
                    dominantBaseline="middle" 
                    textAnchor="middle" 
                    fill="#0a0a0f" 
                    className="font-inter font-black text-sm uppercase tracking-widest"
                  >
                    Get Beta Access
                  </text>
                </svg>
              </div>
           </div>

           {/* Founders / Team Panel (Filling Empty Space) */}
           <div className="glass p-12 border-white/5 flex flex-col gap-12 bg-white/5 backdrop-blur-3xl">
              <div className="space-y-4">
                 <h4 className="font-rubik text-xs font-black uppercase tracking-[0.4em] text-primary">Foundational Leadership</h4>
                 <div className="flex flex-col gap-4">
                    {["Salaj", "Saloni", "Sanjna"].map((founder, i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-white/5">
                         <span className="font-inter text-lg font-black text-white/40">{founder}</span>
                         <span className="text-[10px] uppercase font-rubik font-black text-primary bg-primary/10 px-2 py-1 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Core Founder
                         </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                 <p className="font-inter text-[11px] text-onSurface/30 leading-relaxed italic">
                    "We are building LexShift to be the definitive bridge between the old IPC and the new BNS reality—architected for speed, security, and absolute statutory accuracy."
                 </p>
                 <div className="w-full h-px bg-white/5" />
                 <span className="text-[9px] font-rubik font-black uppercase tracking-[0.4em] text-white/20">The LexShift Engine Group</span>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;
