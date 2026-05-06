/**
 * @file src/features/home/MarqueeTicker.jsx
 * @description Advanced GSAP-controlled scrolling marquee.
 * 
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const MarqueeTicker = () => {
  const marqueeRef = useRef(null);
  const words = [
    "IPC TO BNS", "AI-POWERED", "PRIVACY-FIRST", "ZERO STORAGE", "LEGALLY ACCURATE",
    "IPC TO BNS", "AI-POWERED", "PRIVACY-FIRST", "ZERO STORAGE", "LEGALLY ACCURATE"
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initial Continuous Loop
    
    const marquee = marqueeRef.current;
    const tl = gsap.to(marquee, {
      xPercent: -50, // Move half the width for perfect tiling
      repeat: -1,
      duration: 20,
      ease: "linear"
    });

    // 2. Scroll Interaction
   
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // self.direction: 1 (down), -1 (up)
       
        gsap.to(tl, {
          timeScale: self.direction === 1 ? 2 : -2,
          duration: 0.5,
          overwrite: true,
        });

        
        gsap.to(tl, {
          timeScale: self.direction === 1 ? 1 : -1,
          delay: 0.5,
          duration: 1,
          overwrite: false
        });
      }
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="relative w-full py-20 overflow-hidden bg-background border-y border-white/5 select-none">
      <div 
        ref={marqueeRef}
        className="flex whitespace-nowrap items-center gap-20 w-fit"
      >
        {words.map((word, i) => (
          <span 
            key={i}
            className="font-rubik text-7xl md:text-9xl font-black uppercase tracking-tighter transition-all"
            style={{ 
              color: 'rgba(255, 255, 255, 0.05)',
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)' 
            }}
          >
            {word} <span className="text-primary opacity-50 ml-8">·</span>
          </span>
        ))}
      </div>
      
      {/* Cinematic Ambient Glow behind the text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-32 bg-primary/10 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default MarqueeTicker;
