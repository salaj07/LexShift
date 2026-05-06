import { useEffect, useRef } from "react";
import Lenis from "lenis";

const SmoothScroll = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (lenisRef.current) return; // prevent re-init

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
      orientation: "vertical",
      gestureOrientation: "vertical",
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      lenis._rafId = requestAnimationFrame(raf);
    };

    lenis._rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(lenis._rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
};

export default SmoothScroll;
