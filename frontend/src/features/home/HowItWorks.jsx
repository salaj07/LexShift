import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload, Target, Activity, FileDown } from "lucide-react";

const HowItWorks = () => {
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
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".step-card");

      //* MOBILE ANIMATION

      if (isMobile) {
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 40,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        return;
      }

      //* DESKTOP ANIMATION
      
      gsap.set(cards, {
        opacity: 0,
        y: 80,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1800",
          scrub: 1,
          pin: containerRef.current,
          anticipatePin: 1,
          markers: false,
        },
      });

      cards.forEach((card, i) => {
        tl.to(
          card,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          i * 0.5
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isMobile]);

  const steps = [
    {
      id: "01",
      title: "UPLOAD",
      subtitle: "Secure Ingestion",
      points: [
        "Drag and drop legal PDF files",
        "OCR support for legacy scans",
        "Secure stream to ephemeral storage",
      ],
      icon: <Upload className="w-8 h-8 text-primary" />,
    },
    {
      id: "02",
      title: "TARGET",
      subtitle: "Precision Mapping",
      points: [
        "Select matching IPC sections",
        "Cross-reference case precedents",
        "Automated statutory detection",
      ],
      icon: <Target className="w-8 h-8 text-secondary" />,
    },
    {
      id: "03",
      title: "ANALYZE",
      subtitle: "Core Engine Process",
      points: [
        "Decoupled, hybrid AI architecture",
        "Context-sensitive law mapping",
        "Massive scale background analysis",
      ],
      icon: <Activity className="w-8 h-8 text-primary" />,
    },
    {
      id: "04",
      title: "EXPORT",
      subtitle: "Reference-Ready",
      points: [
        "DOCX/PDF formatted output",
        "Statutory correlation summary",
        "Direct export for drafting",
      ],
      icon: <FileDown className="w-8 h-8 text-secondary" />,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#071013] overflow-hidden z-10"
    >
      <div
        ref={containerRef}
        className={`
          w-full
          px-4 sm:px-8 md:px-16 lg:px-24
          py-16 md:py-0
          bg-[#071013]
          ${
            isMobile
              ? "relative"
              : "h-screen flex flex-col justify-center"
          }
        `}
      >
        {/* HEADER */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-[8px] md:text-[10px] uppercase tracking-[0.8em] md:tracking-[1em] text-primary font-black mb-4 md:mb-6">
            THE METHODOLOGY
          </h2>

          <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-tight">
            Advanced <br className="hidden md:block" />
            Legal Pipeline.
          </h3>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="step-card flex flex-col space-y-6 p-5 md:p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                {step.icon}

                <span className="text-white/20 text-2xl md:text-3xl font-bold">
                  {step.id}
                </span>
              </div>

              <h4 className="text-white font-bold text-base md:text-lg">
                {step.title}
              </h4>

              <ul className="text-white/60 text-sm space-y-2">
                {step.points.map((p, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;