'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
  return (
    <aside
      aria-label="VIP WhatsApp Concierge"
      className="fixed bottom-6 right-6 z-40 flex items-center group select-none"
    >
      <a
        href="https://wa.me/923000000000?text=Salam%20Miss%20Stitch!%20I%20would%20like%20assistance%20with%20custom%20stitching%20and%20sizing."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-[#0A5C36] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#074729] hover:scale-105 transition-all duration-200"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4ADE80] rounded-full border-2 border-[#0A5C36] animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-white/80 font-semibold leading-none">
            Stylist Online
          </p>
          <p className="text-xs font-bold text-white mt-0.5 leading-none">
            Chat on WhatsApp
          </p>
        </div>
      </a>
    </aside>
  );
};
