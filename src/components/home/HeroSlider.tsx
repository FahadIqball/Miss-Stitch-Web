'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Scissors, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';
import { HeroSlide } from '@/types';
import { DEFAULT_HERO_SLIDES } from '@/data/cmsDefaults';

interface HeroSliderProps {
  initialSlides?: HeroSlide[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ initialSlides }) => {
  const slides = (initialSlides && initialSlides.length > 0) ? initialSlides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];

  return (
    <section className="relative bg-[#1F1F24] text-white overflow-hidden select-none">
      {/* Background Image Carousel with Optimized Desktop & Mobile Fit */}
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px] w-full">
        {slides.map((s, idx) => (
          <div
            key={s.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {s.image ? (
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                className="object-cover object-center sm:object-[80%_center] lg:object-[85%_30%]"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-[#1F1F24]" />
            )}
            {/* Elegant Solid Gradient Overlay: dark on left for text legibility, clear on right for fashion showcase */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F24] via-[#1F1F24]/85 sm:via-[#1F1F24]/60 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F24]/80 via-transparent to-transparent sm:hidden" />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-xl space-y-4 sm:space-y-6 animate-in fade-in duration-700">
            {/* Tag Badge */}
            {slide.tag && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F1F24] border border-[#D4AF37] rounded text-white text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#F3A712]" />
                <span>{slide.tag}</span>
              </div>
            )}

            {/* Title & Subtitle */}
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="font-serif text-lg sm:text-2xl text-[#D4AF37] italic mt-1 sm:mt-2">
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            {slide.description && (
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                {slide.description}
              </p>
            )}

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {slide.ctaPrimaryText && (
                <Link
                  href={slide.ctaPrimaryLink || '/shop'}
                  className="btn-rani px-8 py-3.5 rounded text-xs sm:text-sm font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>{slide.ctaPrimaryText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {slide.ctaSecondaryText && (
                <Link
                  href={slide.ctaSecondaryLink || '/custom-stitching'}
                  className="btn-gold-outline px-8 py-3.5 rounded text-xs sm:text-sm font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4 text-[#D4AF37]" />
                  <span>{slide.ctaSecondaryText}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
              className="p-2.5 bg-[#1F1F24]/80 border border-white/20 text-white rounded hover:bg-[#E61A6B] transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-white/80 px-2">
              0{currentSlide + 1} / 0{slides.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-2.5 bg-[#1F1F24]/80 border border-white/20 text-white rounded hover:bg-[#E61A6B] transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="bg-[#18181C] border-t border-[#D4AF37]/30 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-white/90">
            <Truck className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <strong className="block text-white">Free Nationwide Shipping</strong>
              <span className="text-white/60 text-[11px]">Orders over Rs. 4,999</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-white/90">
            <Scissors className="w-5 h-5 text-[#E61A6B] shrink-0" />
            <div>
              <strong className="block text-white">Digital Master Silai</strong>
              <span className="text-white/60 text-[11px]">7–10 Days Bespoke Delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-white/90">
            <ShieldCheck className="w-5 h-5 text-[#0A5C36] shrink-0" />
            <div>
              <strong className="block text-white">100% Original Designer Fabric</strong>
              <span className="text-white/60 text-[11px]">Authenticity Guaranteed</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-white/90">
            <RefreshCw className="w-5 h-5 text-[#F3A712] shrink-0" />
            <div>
              <strong className="block text-white">Easy Cash on Delivery</strong>
              <span className="text-white/60 text-[11px]">Pay upon arrival</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
