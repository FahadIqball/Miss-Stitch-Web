'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scissors, Check, Sparkles, ArrowRight } from 'lucide-react';

export const AtelierBanner: React.FC = () => {
  return (
    <section className="py-16 bg-[#1F1F24] text-white relative overflow-hidden border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2B2B33] border border-[#D4AF37] rounded text-[#FAF8F5] text-xs font-bold uppercase tracking-widest">
              <Scissors className="w-3.5 h-3.5 text-[#E61A6B]" />
              <span>Generational Master Karigari</span>
            </div>

            <div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Bespoke Silai, Flawless Finishing & Luxury Linings
              </h2>
              <p className="font-serif text-xl text-[#D4AF37] italic mt-2">
                No more tailors delaying your festive events.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Every unstitched lawn, organza, and velvet suit can be transformed into a runway-ready formal ensemble by our in-house master tailors in Lahore and Karachi. We ensure:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/90">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0" />
                <span>Pure Cotton & Silk Linings (Shameez)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0" />
                <span>Hand-finished Latkan & Pearl Tassels</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0" />
                <span>Custom Trouser Cuts (Tulip, Cigarette, Bell)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#0A5C36] shrink-0" />
                <span>Laser Cutwork & Interlock Hem Finishing</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/custom-stitching"
                className="btn-rani px-8 py-3.5 rounded text-xs sm:text-sm font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Explore Digital Silai Atelier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="btn-gold-outline px-8 py-3.5 rounded text-xs sm:text-sm font-bold uppercase tracking-wider text-center"
              >
                <span>Browse Unstitched Suits</span>
              </Link>
            </div>
          </div>

          {/* Right: Rich Imagery Showcase */}
          <div className="relative">
            <div className="relative h-96 sm:h-[440px] rounded-xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1000&q=80"
                alt="Pakistani Luxury Embroidery Details"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#1F1F24]/95 border border-[#D4AF37]/40 rounded-lg text-xs">
                <div className="flex items-center justify-between text-[#D4AF37] font-bold uppercase tracking-wider mb-1">
                  <span>Master Atelier Finishing</span>
                  <span>7–10 Working Days</span>
                </div>
                <p className="text-white/80 text-[11px]">
                  Precision zardozi border alignment, scalloped dupatta matha patti, and comfortable seamless linings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
