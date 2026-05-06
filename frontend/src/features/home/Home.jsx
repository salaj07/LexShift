/**
 * @file src/features/home/Home.jsx
 * @description Master Aggregator with Stacking Card Parallax.
 * 
 * Aggregates all cinematic and functional sections:
 * - Each primary section uses 'sticky' for a stacking parallax effect.
 * - Dynamic theme shifts per section (Near Black -> Deep Indigo -> Midnight Cyan).
 */

import React from 'react';
import Hero from './Hero';
import Converter from '../converter/Converter';
import Modules from './Modules';
import MarqueeTicker from './MarqueeTicker';
import BentoGrid from './BentoGrid';
import HowItWorks from './HowItWorks';
import PrivacyFocus from './PrivacyFocus';
import Architecture from './Architecture';
import Stats from './Stats';
import FinalCTA from './FinalCTA';
import Footer from '../../components/shared/Footer';

const Home = () => {
  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-background">
      
      {/* 1. Cinematic Identity (Base Layer) */}
      <div className="relative sticky top-0 z-10 w-full min-h-screen flex items-center justify-center">
        <Hero />
      </div>

      {/* 2. CORE ENGINE (Stacking Layer 1) */}
      <div className="relative sticky top-0 z-20 w-full min-h-screen bg-[#0f0f1a] shadow-[0_-50px_100px_rgba(0,0,0,0.8)] flex items-center justify-center">
        <Converter />
      </div>

      {/* 3. PROFESSIONAL MODULES (Stacking Layer 2) */}
      <div className="relative sticky top-0 z-30 w-full min-h-screen bg-background shadow-[0_-50px_100px_rgba(0,0,0,0.8)] flex items-center justify-center">
        <Modules />
      </div>

      {/* 4. Marquee & Bento (Stacking Layer 3) */}
      <div className="relative sticky top-0 z-40 w-full min-h-screen bg-background flex flex-col items-center justify-center shadow-[0_-50px_100px_rgba(0,0,0,0.8)]">
        <MarqueeTicker />
        <BentoGrid />
      </div>

      {/* 5. Process Workflow (Stacking Layer 4) */}
      <div className="relative sticky top-0 z-50 w-full min-h-screen bg-[#071013] shadow-[0_-50px_100px_rgba(0,0,0,0.8)] flex items-center justify-center">
        <HowItWorks />
      </div>

      {/* 6. Technical Authority (Stacking Layer 5) */}
      <div className="relative sticky top-0 z-60 w-full min-h-screen bg-background shadow-[0_-50px_100px_rgba(0,0,0,0.8)] flex items-center justify-center">
        <Architecture />
      </div>

      {/* 7. Footer Group (Final Flow Layer) */}
      <div className="relative z-[70] w-full bg-background shadow-[0_-50px_100px_rgba(0,0,0,0.8)]">
        <PrivacyFocus />
        
        <Stats />
        
        <FinalCTA />
        <Footer />
      </div>

    </div>
  );
};

export default Home;
