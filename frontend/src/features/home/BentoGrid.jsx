/**
 * @file src/features/home/BentoGrid.jsx
 */

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Search, FileText, Zap, Lock } from "lucide-react";

const BentoGrid = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = containerRef.current.children;

      if (isMobile) {
        // Mobile: Individual fade-in animations triggered on scroll
        Array.from(cards).forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              delay: i * 0.1,
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none",
                markers: false,
              },
            },
          );
        });
      } else {
        // Desktop: Scroll-linked timeline animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: `+=${cards.length * 200}`,
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        gsap.set(cards, { opacity: 0, y: 80 });

        Array.from(cards).forEach((card, i) => {
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            i * 0.15,
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const features = [
    {
      title: "IPC TO BNS",
      desc: "Instant mapping of legacy laws to the new Bharatiya Nyaya Sanhita with context-aware logic.",
      detail: "NER-DRIVEN MAPPING",
      icon: <FileText className="w-6 h-6 text-primary" />,
      className:
        "md:col-span-2 md:row-span-1 bg-gradient-to-br from-white/10 to-transparent",
    },
    {
      title: "CASE SEARCH",
      desc: "AI-powered semantic search across 10M+ precedents.",
      detail: "VECTOR DB SYNC",
      icon: <Search className="w-6 h-6 text-secondary" />,
      className: "md:col-span-1 md:row-span-1",
    },
    {
      title: "PRIVACY VAULT",
      desc: "End-to-end AES-256 encryption. Zero-retention protocol.",
      detail: "SOC2 COMPLIANT",
      icon: <Lock className="w-6 h-6 text-primary" />,
      className: "md:col-span-1 md:row-span-2 bg-primary/5",
    },
    {
      title: "FAST ANALYSIS",
      desc: "100+ page judgment summaries delivered in < 1.2s.",
      detail: "LLM TURBO",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      className: "md:col-span-1 md:row-span-1",
    },
    {
      title: "ZERO LOGS",
      desc: "Ephemeral processing cycles for maximum sensitivity.",
      detail: "RAM-ONLY EXECUTION",
      icon: <Shield className="w-6 h-6 text-green-400" />,
      className: "md:col-span-1 md:row-span-1",
    },
    {
      title: "BATCH PROCESS",
      desc: "Concurrent processing of 500+ legal files.",
      detail: "BULLMQ CLUSTER",
      icon: <FileText className="w-6 h-6 text-primary" />,
      className: "md:col-span-1 md:row-span-1",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col justify-center py-12 md:py-24 px-4 md:px-8 lg:px-16 bg-background border-t border-white/5"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-8">
        <div className="space-y-6">
          <h2 className="font-rubik text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-widest leading-none">
            Platform <br className="md:hidden" /> Capabilities.
          </h2>
          <div className="w-24 md:w-32 h-1 bg-primary" />
        </div>

        <p className="font-inter text-xs md:text-sm text-onSurface/40 max-w-sm leading-relaxed">
          LexShift uses a high-density processing aggregate to manage every
          facet of the statutory transition.
        </p>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[280px]"
      >
        {features.map((f, i) => (
          <div
            key={i}
            className={`glass opacity-100 p-6 md:p-10 flex flex-col justify-between group hover:border-primary/50 transition-all duration-500 cursor-default ${f.className}`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <span className="text-[8px] font-black font-rubik text-primary bg-primary/10 px-2 py-1 rounded tracking-[0.2em]">
                  {f.detail}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-rubik text-2xl font-black text-white tracking-wider group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="font-inter text-[13px] text-onSurface/50 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-rubik font-black uppercase tracking-widest text-white/40 group-hover:text-primary">
                System Auth v1.0
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white">
                0{i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;
