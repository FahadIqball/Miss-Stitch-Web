import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Scissors,
  Ruler,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const metadata = {
  title: 'Digital Silai Atelier & Tailoring Guide | Miss Stitch',
  description: 'Learn how Miss Stitch master bespoke tailoring works. Transparent fees, custom inch measurements, linings, and 7-10 days delivery.',
};

export default function CustomStitchingPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-6">
          <Link href="/" className="hover:text-[#E61A6B]">Home</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold">Digital Silai Atelier</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white border border-[#E5E2DC] rounded-2xl p-6 sm:p-12 mb-12 shadow-xs text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E61A6B]/10 text-[#E61A6B] text-xs font-bold uppercase tracking-widest mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Master Craftsmanship</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1F24] mb-4 leading-tight">
            The Digital Silai Atelier
          </h1>
          <p className="text-xs sm:text-base text-[#66666E] max-w-2xl mx-auto leading-relaxed">
            Never worry about tailor delays, ruined necklines, or ill-fitting trousers again. Miss Stitch combines generational Pakistani tailoring karigari with precision digital sizing.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/shop?category=unstitched" className="btn-rani px-8 py-3.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
              <span>Shop Suits for Stitching</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/account" className="btn-gold-outline px-8 py-3.5 rounded text-xs font-bold uppercase tracking-wider">
              <span>Open My Sizing Vault</span>
            </Link>
          </div>
        </div>

        {/* 3 Core Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E5E2DC] flex items-center justify-center text-[#1F1F24] mb-4">
                <span className="font-serif text-lg font-bold">01</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
                Unstitched Fabric
              </h3>
              <p className="text-xs text-[#66666E] leading-relaxed mb-4">
                Receive the complete designer suit box with 100% original fabric cut pieces, embroidered necklines, daman borders, and sleeves patches.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E2DC] text-xs text-[#0A5C36] font-semibold">
              ✓ Dispatches in 24 Hours
            </div>
          </div>

          <div className="bg-white border-2 border-[#D4AF37] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#FAF5E6] border border-[#D4AF37] flex items-center justify-center text-[#E61A6B] mb-4">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
                Standard Ready-to-Wear Silai
              </h3>
              <p className="text-xs text-[#66666E] leading-relaxed mb-4">
                Choose standard sizes XS to XXL with choice of Standard 42&quot; or Long 46&quot; shirt length. Perfectly finished with interlock and neat hem.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E2DC] text-xs text-[#1F1F24] font-bold">
              Fee: Flat +Rs. 3,500
            </div>
          </div>

          <div className="bg-white border-2 border-[#E61A6B] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#E61A6B]/10 flex items-center justify-center text-[#E61A6B] mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
                Custom Made-to-Measure
              </h3>
              <p className="text-xs text-[#66666E] leading-relaxed mb-4">
                Provide custom inch metrics for chest, waist, hips, shoulder, sleeves, and trouser length. Select custom cuts like Tulip Shalwar or Bell Bottoms.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E2DC] text-xs text-[#E61A6B] font-bold">
              Fee: Flat +Rs. 4,500 (100% Fit Guarantee)
            </div>
          </div>
        </div>

        {/* Illustrated Trouser Cuts */}
        <div className="bg-white border border-[#E5E2DC] rounded-2xl p-8 mb-16 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24]">
              Available Trouser Silai Styles
            </h2>
            <p className="text-xs text-[#66666E] mt-1">
              Select your preferred bottom cut when configuring any custom made-to-measure suit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center text-xs">
            {[
              { name: 'Cigarette Pants', desc: 'Sleek, tapered cut above ankle. Ideal for straight kurtis & formal raw silk.' },
              { name: 'Loose Shalwar', desc: 'Traditional pleated shalwar with comfortable loose drape & neat poncha.' },
              { name: 'Tulip Shalwar', desc: 'Overlapping petal hemline with delicate lace or pearl trim. Perfect for short shirts.' },
              { name: 'Flared Bell Bottom', desc: 'Dramatic retro flare from knee down. Stitched with organza insertion pleats.' },
              { name: 'Straight Trouser', desc: 'Classic comfort trouser with relaxed leg width and elasticized waistband.' },
            ].map((cut) => (
              <div key={cut.name} className="p-4 bg-[#FAF8F5] border border-[#E5E2DC] rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center mx-auto mb-2 text-[#E61A6B]">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#1F1F24] mb-1">{cut.name}</h4>
                  <p className="text-[11px] text-[#66666E] leading-relaxed">{cut.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bottom Banner */}
        <div className="bg-[#1F1F24] text-white rounded-2xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            Ready to Experience Flawless Bespoke Silai?
          </h3>
          <p className="text-xs text-white/70 mb-6 max-w-md mx-auto">
            Pick any unstitched festive suit and let our master artisans tailor it to perfection.
          </p>
          <Link href="/shop" className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
            <span>Explore Unstitched Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
