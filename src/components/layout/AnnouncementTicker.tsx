'use client';

import React from 'react';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { AnnouncementBarSettings, CurrencyCode } from '@/types';
import { Phone, Sparkles, Globe } from 'lucide-react';
import { DEFAULT_ANNOUNCEMENT_BAR } from '@/data/cmsDefaults';

interface AnnouncementTickerProps {
  initialSettings?: AnnouncementBarSettings;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({
  initialSettings = DEFAULT_ANNOUNCEMENT_BAR,
}) => {
  const { currentCurrency, setCurrency } = useCurrencyStore();

  if (initialSettings && initialSettings.enabled === false) {
    return null;
  }

  const phoneClean = (initialSettings.whatsappNumber || '923000000000').replace(/[^0-9]/g, '');

  return (
    <div className="bg-[#1F1F24] text-[#FAF8F5] text-xs font-medium py-2 px-4 border-b border-[#D4AF37]/30 select-none relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: WhatsApp Direct */}
        <div className="hidden md:flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <Phone className="w-3.5 h-3.5 text-[#E61A6B]" />
          <span>VIP Helpline:</span>
          <a
            href={`https://wa.me/${phoneClean}?text=Hi%20Miss%20Stitch%2C%20I%20need%20styling%20and%20stitching%20assistance.`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:underline font-semibold"
          >
            +{phoneClean}
          </a>
        </div>

        {/* Center: Live Marquee / Ticker Message */}
        <div className="flex-1 overflow-hidden mx-2">
          <div className="flex items-center justify-center gap-3 text-center whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-[#F3A712] animate-pulse shrink-0" />
              <span>{initialSettings.primaryMessage}</span>
            </span>
            {initialSettings.secondaryMessage && (
              <>
                <span className="text-white/40 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-white/80">
                  {initialSettings.secondaryMessage}
                </span>
              </>
            )}
            {initialSettings.promoCode && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-[#2C2C34] border border-[#D4AF37]/50 rounded text-[#D4AF37] font-mono text-[10px] font-bold uppercase">
                CODE: {initialSettings.promoCode}
              </span>
            )}
          </div>
        </div>

        {/* Right: Multi-Currency Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Globe className="w-3.5 h-3.5 text-white/60" />
          <select
            value={currentCurrency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-[#2B2B33] text-white text-xs font-semibold rounded px-2 py-0.5 border border-white/10 focus:outline-none focus:border-[#D4AF37] cursor-pointer hover:bg-[#34343D] transition-colors"
            aria-label="Select Currency"
          >
            <option value="PKR">PKR (Rs.)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AED">AED (AED)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
