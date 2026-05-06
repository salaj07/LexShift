/**
 * @file src/features/home/Architecture.jsx
 * @description Technical Architecture Reveal: The Bench & Massive Scale.
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Database, Cpu, Share2 } from 'lucide-react';

const Architecture = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".stack-card", {
      opacity: 0,
      x: -50,
      duration: 1.2,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        once: true,
      }
    });

  }, []);

  const stack = [
    {
      title: "MERN STACK",
      subtitle: "The Foundation",
      features: [
        "React for professional legal UI",
        "Node.js & Express.js API gateway",
        "Blazing-fast statutory research",
        "Real-time WebSocket updates"
      ],
      icon: <Layers className="w-5 h-5 text-primary" />,
    },
    {
      title: "AI ENGINE",
      subtitle: "LexShift Intelligence",
      features: [
        "LangChain statutory orchestration",
        "Context-sensitive IPC ➔ BNS mapping",
        "Local PII scrubbing NER shield",
        "Zero AI hallucination constraints"
      ],
      icon: <Cpu className="w-5 h-5 text-secondary" />,
    },
    {
      title: "ASYNC PIPELINE",
      subtitle: "Massive Scale",
      features: [
        "Redis + BullMQ background analysis",
        "10,000+ concurrent user support",
        "Decoupled event-driven scaling",
        "Zero-latency processing"
      ],
      icon: <Share2 className="w-5 h-5 text-primary" />,
    },
    {
      title: "EPHEMERAL S3",
      subtitle: "Secure Storage",
      features: [
        "AWS S3 encrypted vaulting",
        "Auto-expiry file deletion",
        "Zero-retention data privacy",
        "AES-256 binary encryption"
      ],
      icon: <Database className="w-5 h-5 text-secondary" />,
    },
  ];

  return (
    <section ref={containerRef} className="relative w-full min-h-screen py-24 px-8 md:px-16 lg:px-24 bg-background overflow-hidden flex items-center">
      {/* Background Radial Glow Anchor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-primary/5 blur-[120px] rounded-full opacity-60 z-0" />
      <div className="absolute inset-0 z-0 bg-grid opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-32 relative z-10 w-full">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl">
          <span className="font-rubik text-[10px] font-black uppercase tracking-[1em] text-primary">
            ANALYZE. EXECUTE. SCALE.
          </span>
          <h2 className="font-rubik text-5xl md:text-7xl font-black uppercase text-white leading-none">
            Built For <br /> The Bench.
          </h2>
          <p className="font-inter text-base text-onSurface/40 max-w-lg leading-relaxed">
            LexShift uses a **decoupled, hybrid architecture** to manage complex legal statutory mapping at massive, enterprise-grade scale.
          </p>
        </div>

        {/* Multi-Dimensional Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">

          {/* Left: Technical Stack (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {stack.map((item, i) => (
              <div key={i} className="stack-card glass p-10 flex flex-col space-y-10 group hover:border-primary/50 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                    {item.icon}
                  </div>
                  <span className="font-rubik text-3xl font-black text-white/5 select-none">0{i + 1}</span>
                </div>
                <div className="space-y-6 flex-1">
                  <div>
                    <h3 className="font-rubik text-xl font-black uppercase text-white tracking-widest group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-inter text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                      {item.subtitle}
                    </p>
                  </div>
                  <ul className="space-y-3 pt-4">
                    {item.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[11px] text-onSurface/40 font-medium font-inter">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Authority Metrics (4 Cols - Filling Empty Space) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass p-10 border-primary/20 bg-primary/5 space-y-8">
              <h4 className="font-rubik text-xs font-black uppercase tracking-[0.4em] text-primary">
                Engineering Proof
              </h4>
              <div className="space-y-8">
                {[
                  { label: "Request Latency", value: "< 250ms", detail: "Global Edge Sync" },
                  { label: "Statutory Accuracy", value: "99.98%", detail: "NLP Verified" },
                  { label: "Max Concurrent", value: "10K+", detail: "Redis Queue" }
                ].map((metric, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-rubik font-black uppercase tracking-widest text-white/30">{metric.label}</span>
                      <span className="text-2xl font-rubik font-black text-white">{metric.value}</span>
                    </div>
                    <div className="w-full h-px bg-white/5" />
                    <p className="text-[9px] font-inter text-primary font-bold uppercase tracking-widest">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-10 border-white/5 bg-white/5 space-y-4">
              <p className="font-inter text-[10px] text-onSurface/40 leading-relaxed italic">
                "Our decoupled architecture ensures that judge-level accuracy is maintained even during peak statutory transition cycles."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[9px] font-rubik font-black uppercase tracking-widest text-primary">Technical Lead</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Architecture;
