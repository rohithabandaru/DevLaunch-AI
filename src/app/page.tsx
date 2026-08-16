'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Showcase } from '@/components/landing/Showcase';
import { Stats } from '@/components/landing/Stats';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { DemoModal } from '@/components/landing/DemoModal';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0B1020] text-white selection:bg-[#6366F1] selection:text-white relative overflow-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero onOpenDemo={() => setDemoOpen(true)} />

      {/* Feature Cards Section */}
      <Features />

      {/* How It Works Timeline Section */}
      <HowItWorks />

      {/* Resume & Portfolio Showcase / Templates Section */}
      <Showcase />

      {/* Key Metrics / Statistics Section */}
      <Stats />

      {/* User Testimonials Section */}
      <Testimonials />

      {/* SaaS Pricing Section */}
      <Pricing />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Bottom Banner */}
      <CTA />

      {/* Footer */}
      <Footer />

      {/* Interactive Demo Lightbox Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
}
