'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, Ruler, Truck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    stepNumber: '01',
    icon: Sparkles,
    title: 'Select Your Designer Suit',
    description: 'Browse our catalog of luxury festive lawn, velvet formals, or chiffon 3-piece unstitched fabrics or pret.',
    badge: 'Step 1: Choice',
  },
  {
    stepNumber: '02',
    icon: Ruler,
    title: 'Choose Standard Size or Custom Inches',
    description: 'Pick ready sizes (XS to XXL) or enter custom chest, waist, shoulder, and trouser cut metrics in inches.',
    badge: 'Step 2: Fitting',
  },
  {
    stepNumber: '03',
    icon: Scissors,
    title: 'Master Tailoring & Fast Delivery',
    description: 'Our generational karigars craft your suit with attached pure cotton lining, pico, and hand-finished latkan tassels.',
    badge: 'Step 3: 7–10 Days Silai',
  },
];

export const HowSilaiWorks: React.FC = () => {
  return (
    <section className="py-16 bg-[#FAF8F5] border-b border-[#E5E2DC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A5C36]/10 text-[#0A5C36] text-xs font-bold uppercase tracking-widest mb-2">
            <Scissors className="w-3.5 h-3.5" />
            <span>Digital Tailoring Atelier</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
            How Miss Stitch Tailoring Works
          </h2>
          <p className="text-xs sm:text-sm text-[#66666E] mt-2">
            Zero hassle, transparent tailoring fees, and guaranteed bespoke fit delivered right to your doorstep.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-3xl font-bold text-[#D4AF37]">
                      {step.stepNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1F1F24] border border-[#E5E2DC]">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-[#FAF5E6] text-[#1F1F24] flex items-center justify-center mb-4 border border-[#D4AF37]/40">
                    <Icon className="w-6 h-6 text-[#E61A6B]" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1F1F24] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#66666E] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E2DC] flex items-center gap-1.5 text-[11px] font-semibold text-[#0A5C36]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Quality Inspected Before Dispatch</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive CTA Strip */}
        <div className="mt-10 p-6 bg-[#FAF5E6] border border-[#D4AF37]/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F1F24] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-[#1F1F24]">
                Already have custom measurements saved?
              </h4>
              <p className="text-xs text-[#66666E]">
                Save your inch profiles in the <strong>Sizing Vault</strong> for 1-click order placement anytime.
              </p>
            </div>
          </div>

          <Link
            href="/custom-stitching"
            className="btn-rani px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <span>Learn More About Silai</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
