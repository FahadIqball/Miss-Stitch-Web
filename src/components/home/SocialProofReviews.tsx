'use client';

import React from 'react';
import Image from 'next/image';
import { CUSTOMER_REVIEWS } from '@/data/reviews';
import { Star, CheckCircle2, MapPin, Sparkles, Quote } from 'lucide-react';

export const SocialProofReviews: React.FC = () => {
  return (
    <section className="py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E61A6B]/10 text-[#E61A6B] text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Women. Real Festive Fits.</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
            Loved by Pakistani Women Globally
          </h2>
          <p className="text-xs sm:text-sm text-[#66666E] mt-2">
            Over 12,000+ unstitched and custom-stitched suits delivered with 5-star perfection.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with avatar & stars */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#D4AF37]/50 shrink-0">
                      <Image
                        src={rev.avatarImage}
                        alt={rev.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1F1F24] leading-tight">
                        {rev.name}
                      </h4>
                      <p className="text-[10px] text-[#66666E] flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#E61A6B]" />
                        <span>{rev.city}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-[#F3A712]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F3A712]" />
                    ))}
                  </div>
                </div>

                {/* Suit Tag & Stitching Mode */}
                <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-2 rounded text-[10px] space-y-0.5 mb-3">
                  <div className="font-bold text-[#1F1F24] truncate">
                    {rev.suitName}
                  </div>
                  <div className="text-[#0A5C36] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{rev.stitchingType}</span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-[#1F1F24]/80 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Verified Badge */}
              <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-between text-[10px] text-[#66666E]">
                <span className="flex items-center gap-1 font-semibold text-[#0A5C36]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Purchase</span>
                </span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
