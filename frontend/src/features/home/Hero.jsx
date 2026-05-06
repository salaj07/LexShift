/**
 * @file src/features/home/Hero.jsx
 * @description Operational Hero for LexShift.
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import heroVideo from "../../assets/hf_20260206_044704_dd33cb15-c23f-4cfc-aa09-a0465d4dcb54.mp4";

const Hero = () => {
  const headlineRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!headlineRef.current || !ctaRef.current) return;

    const headings = headlineRef.current.querySelectorAll("h1");

    gsap.set(headings, { opacity: 0, y: 80 });
    gsap.set(ctaRef.current, { opacity: 0, scale: 0.9 });

    const tl = gsap.timeline();

    tl.to(headings, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
    }).to(
      ctaRef.current,
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
      },
      "-=0.6",
    );
  }, []);

  const scrollToEngine = () => {
    const engine = document.getElementById("converter-engine");
    if (engine) {
      engine.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center pt-23 pb-24 px-4 sm:px-8 md:px-16 lg:px-24 bg-background z-10">
      {/* Background Texture & Grid Layer */}
      <div className="absolute inset-0 z-0 bg-grid opacity-20" />

      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-[0.35]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
      </div>

      {/* Hero Content (Foreground) */}
      <div className="relative z-20 flex flex-col items-start max-w-7xl mx-auto w-full group">
        {/* Platform Integrity Badge (Filling Empty Space) */}
        <div className="mb-12 flex items-center gap-4 py-2 px-4 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-rubik text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            System Live: IPC ➔ BNS Sync Active
          </span>
        </div>

        <div ref={headlineRef} className="flex flex-col  ">
          <span className="font-rubik text-xs md:text-sm uppercase tracking-[0.5em] text-primary mb-3 ">
            AI-POWERED LEGAL EVOLUTION
          </span>

          <div className="leading-none">
            <h1 className="font-[interTight-Black] text-[clamp(3rem,8vw,7.5rem)] uppercase text-white tracking-[-1px] drop-shadow-2xl mb-1 md:-mb-4 lg:-mb-5">
              IPC TO BNS
            </h1>

            <h1 className="font-[interTight-Black] text-[clamp(3rem,8vw,7.5rem)] uppercase text-white tracking-[-1px] drop-shadow-2xl mb-1 md:-mb-4 lg:-mb-5">
              EVOLUTION
            </h1>

            <h1 className="font-[interTight-Black] text-[clamp(3rem,8vw,7.5rem)] uppercase text-white tracking-[-1px] drop-shadow-2xl">
              MAPPED.
            </h1>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-end w-full">
          <div className="space-y-8">
            <p className="font-inter text-sm md:text-lg text-onSurface/50 max-w-lg leading-relaxed tracking-wide">
              Automatically convert historical legal documents into the new
              Bharatiya Nyaya Sanhita (BNS) framework with context-aware AI
              precision and zero-trust privacy.
            </p>

            {/* CTA Button Scroll to Engine */}
            <div
              ref={ctaRef}
              onClick={scrollToEngine}
              className="transition-transform hover:scale-105 active:scale-95 cursor-pointer inline-block"
            >
              <svg
                width="clamp(160px, 50vw, 240px)"
                viewBox="0 0 240 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d="M40 0H240L200 80H0L40 0Z" fill="#FFFFFF" />
                <text
                  x="50%"
                  y="50%"
                  dy="0.3em"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#000000"
                  stroke="none"
                  className="font-inter font-black text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] uppercase tracking-widest pointer-events-none"
                >
                  Start Converting
                </text>
              </svg>
            </div>
          </div>

          {/* Hero Secondary Info (Filling Empty Space) */}
          <div className="hidden lg:flex flex-col items-end gap-12 text-right">
            <div className="space-y-2">
              <span className="block font-rubik text-[10px] font-black text-primary uppercase tracking-widest">
                Accuracy Standard
              </span>
              <span className="block font-inter text-2xl font-black text-white/10 uppercase">
                Legal-Grade
              </span>
            </div>
            <div className="space-y-2">
              <span className="block font-rubik text-[10px] font-black text-primary uppercase tracking-widest">
                Privacy Model
              </span>
              <span className="block font-inter text-2xl font-black text-white/10 uppercase">
                Zero-Retention
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-4 sm:left-8 hidden md:flex flex-col items-center gap-2 opacity-30 z-20">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold origin-left -rotate-90 translate-y-[-100%] translate-x-[50%]">
          Scroll
        </span>
        <div className="w-px h-16 bg-white/50" />
      </div>
    </section>
  );
};

export default Hero;
