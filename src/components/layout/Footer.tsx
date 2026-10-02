'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Send,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1F1F24] text-[#FAF8F5] border-t border-[#D4AF37]/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter & Promo Strip */}
        <div className="bg-[#2B2B33] border border-[#D4AF37]/40 rounded-lg p-6 sm:p-8 mb-16 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E61A6B]/20 text-[#E61A6B] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join The Miss Stitch Inner Circle</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              Unlock 10% Off Your First Custom Stitching Order
            </h3>
            <p className="text-sm text-[#FAF8F5]/70 mb-4">
              Receive VIP access to lawn drops, seasonal velvet formals, and master tailor styling tips.
            </p>

            {subscribed ? (
              <div className="bg-[#0A5C36]/20 border border-[#0A5C36] text-[#FAF8F5] p-3 rounded text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0A5C36] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Welcome to the Club! Use promo code:</p>
                  <p className="font-mono text-sm font-bold text-[#F3A712] mt-0.5">FESTIVE10 (Applied at Checkout)</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1F1F24] border border-[#FAF8F5]/20 rounded px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37] flex-1"
                />
                <button
                  type="submit"
                  className="btn-rani px-6 py-2.5 rounded text-sm flex items-center justify-center gap-2 font-bold"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-sm">
          {/* Column 1: Brand & Manifesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#1F1F24] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Miss Stitch
              </span>
            </div>
            <p className="text-white/70 leading-relaxed text-xs">
              Bridging Pakistani luxury pret, festive unstitched designer lawn, and digital master tailoring (*Bespoke Silai*). We craft every garment with millimeter precision and luxury finishing.
            </p>
            <div className="space-y-1.5 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E61A6B]" />
                <span>WhatsApp Helpline: +92 300 0000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>concierge@misstitch.pk</span>
              </div>
            </div>
          </div>

          {/* Column 2: Boutique Showrooms */}
          <div>
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Boutique Flagships</span>
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li>
                <strong className="text-white block">Karachi Flagship</strong>
                <span>Plot 5-C, 7th Zamzama Commercial Lane, Clifton</span>
              </li>
              <li>
                <strong className="text-white block">Lahore Showroom</strong>
                <span>12-K, Main Boulevard & MM Alam Road, Gulberg II</span>
              </li>
              <li>
                <strong className="text-white block">Islamabad Boutique</strong>
                <span>Shop 14, Beverly Centre, Jinnah Avenue, Blue Area</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services */}
          <div>
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4">
              Silai & Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/custom-stitching" className="hover:text-[#D4AF37] transition-colors">
                  How Custom Stitching Works
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">
                  Size Chart & Measurement Guide
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#D4AF37] transition-colors">
                  Track Courier Parcel (TCS / Leopard)
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                  My Sizing Profile Vault
                </Link>
              </li>
              <li>
                <span className="text-white/40">7-Day Return & Stitching Warranty Policy</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust, Shipping & Delivery */}
          <div>
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0A5C36]" />
              <span>Delivery & Trust</span>
            </h4>
            <div className="space-y-3 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span>100% Original Brand Fabric & Handcrafted Embroidery Guarantee.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Unstitched ships in 24h. Custom Silai dispatched in 7–10 working days.</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                  Accepted Payments in Pakistan & Abroad
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="px-2 py-1 bg-white/10 rounded border border-white/15 text-white">Cash on Delivery</span>
                  <span className="px-2 py-1 bg-[#0A5C36]/30 rounded border border-[#0A5C36]/50 text-white">JazzCash / EasyPaisa</span>
                  <span className="px-2 py-1 bg-white/10 rounded border border-white/15 text-white">Visa / Mastercard</span>
                  <span className="px-2 py-1 bg-[#D4AF37]/20 rounded border border-[#D4AF37]/40 text-[#D4AF37]">1Link Bank Transfer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Miss Stitch Couture Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Karachi • Lahore • Islamabad • London • Dubai</span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-[#D4AF37] hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              <span>⚙️ Master Workshop Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
