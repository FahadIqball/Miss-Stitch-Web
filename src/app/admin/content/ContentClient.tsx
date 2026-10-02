'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Sliders,
  Bell,
  Layers,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Eye,
  Scissors,
} from 'lucide-react';
import { HeroSlide, AnnouncementBarSettings, CategoryCardItem } from '@/types';
import {
  updateSiteContentAction,
  resetSiteContentAction,
  uploadCmsImageAction,
} from '@/app/actions/cmsActions';
import { DEFAULT_HERO_SLIDES, DEFAULT_ANNOUNCEMENT_BAR, DEFAULT_CATEGORY_CARDS } from '@/data/cmsDefaults';

interface ContentClientProps {
  initialSlides: HeroSlide[];
  initialAnnouncement: AnnouncementBarSettings;
  initialCategories: CategoryCardItem[];
}

export const ContentClient: React.FC<ContentClientProps> = ({
  initialSlides,
  initialAnnouncement,
  initialCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'announcement' | 'categories'>('hero');

  // Hero Slides State
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  // Announcement Bar State
  const [announcement, setAnnouncement] = useState<AnnouncementBarSettings>(initialAnnouncement);

  // Category Cards State
  const [categories, setCategories] = useState<CategoryCardItem[]>(initialCategories);

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show status banner temporarily
  const showNotice = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 5000);
  };

  // ----------------------------------------------------
  // HERO SLIDE ACTIONS
  // ----------------------------------------------------
  const handleSlideChange = (index: number, field: keyof HeroSlide, value: any) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now(),
      title: 'New Festive Collection',
      subtitle: 'Pure Silk & Hand-Embroidered Zari',
      description: 'Handcrafted master craftsmanship tailored to your exact inch measurements.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
      ctaPrimaryText: 'Shop New Arrivals',
      ctaPrimaryLink: '/shop',
      ctaSecondaryText: 'Custom Silai Atelier',
      ctaSecondaryLink: '/custom-stitching',
      tag: 'NEW ARRIVAL',
    };
    setSlides((prev) => [...prev, newSlide]);
    setSelectedSlideIndex(slides.length);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      showNotice('error', 'You must maintain at least one hero slide on the customer storefront.');
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (selectedSlideIndex >= slides.length - 1) {
      setSelectedSlideIndex(Math.max(0, slides.length - 2));
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setSelectedSlideIndex(targetIndex);
  };

  const handleSlideImageUpload = async (file: File, slideIdx: number) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const res = await uploadCmsImageAction(base64, file.name);
        if (res.success && res.url) {
          handleSlideChange(slideIdx, 'image', res.url);
          showNotice('success', 'Slide banner image uploaded to Supabase Storage!');
        } else {
          showNotice('error', res.error || 'Failed to upload slide image.');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotice('error', err.message || 'File reading error.');
      setIsUploading(false);
    }
  };

  // ----------------------------------------------------
  // CATEGORY CARDS ACTIONS
  // ----------------------------------------------------
  const handleCategoryChange = (index: number, field: keyof CategoryCardItem, value: any) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddCategory = () => {
    const newCard: CategoryCardItem = {
      id: `cat-${Date.now()}`,
      slug: 'ready-to-wear',
      title: 'New Luxury Category',
      subtitle: 'Silk & Organza',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    };
    setCategories((prev) => [...prev, newCard]);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 1) {
      showNotice('error', 'You must maintain at least one category highlight card.');
      return;
    }
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryImageUpload = async (file: File, catIdx: number) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const res = await uploadCmsImageAction(base64, file.name);
        if (res.success && res.url) {
          handleCategoryChange(catIdx, 'image', res.url);
          showNotice('success', 'Category thumbnail uploaded to Supabase Storage!');
        } else {
          showNotice('error', res.error || 'Failed to upload category thumbnail.');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotice('error', err.message || 'File reading error.');
      setIsUploading(false);
    }
  };

  // ----------------------------------------------------
  // SAVE / RESET HANDLERS
  // ----------------------------------------------------
  const handleSaveHero = async () => {
    setIsSaving(true);
    const res = await updateSiteContentAction('hero_slides', slides);
    setIsSaving(false);
    if (res.success) {
      showNotice('success', 'Hero slides saved & customer storefront cache revalidated!');
    } else {
      showNotice('error', res.error || 'Failed to update hero slides.');
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    const res = await updateSiteContentAction('announcement_bar', announcement);
    setIsSaving(false);
    if (res.success) {
      showNotice('success', 'Top announcement ticker saved & customer storefront revalidated!');
    } else {
      showNotice('error', res.error || 'Failed to update announcement bar.');
    }
  };

  const handleSaveCategories = async () => {
    setIsSaving(true);
    const res = await updateSiteContentAction('category_cards', categories);
    setIsSaving(false);
    if (res.success) {
      showNotice('success', 'Category highlight cards saved & customer storefront revalidated!');
    } else {
      showNotice('error', res.error || 'Failed to update category rail.');
    }
  };

  const handleResetSection = async (key: 'hero_slides' | 'announcement_bar' | 'category_cards') => {
    if (!confirm('Are you sure you want to restore factory default presets for this section?')) return;
    setIsSaving(true);
    const res = await resetSiteContentAction(key);
    setIsSaving(false);
    if (res.success) {
      if (key === 'hero_slides') setSlides(DEFAULT_HERO_SLIDES);
      if (key === 'announcement_bar') setAnnouncement(DEFAULT_ANNOUNCEMENT_BAR);
      if (key === 'category_cards') setCategories(DEFAULT_CATEGORY_CARDS);
      showNotice('success', 'Section successfully restored to default presets.');
    } else {
      showNotice('error', res.error || 'Failed to reset section.');
    }
  };

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2DC] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E61A6B] mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Storefront Visual CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24]">
            Visual Content & Banners Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#66666E] mt-1">
            Customize homepage hero carousels, VIP promo tickers, and circular category navigation without code changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-outline px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3 text-[#8E8E98]" />
          </a>
        </div>
      </div>

      {/* Alert Notices */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-[#0A5C36]/10 text-[#0A5C36] border border-[#0A5C36]/20'
              : 'bg-[#990000]/10 text-[#990000] border border-[#990000]/20'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E5E2DC] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'hero'
              ? 'text-[#E61A6B] border-b-2 border-[#E61A6B]'
              : 'text-[#66666E] hover:text-[#1F1F24]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Slides ({slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'announcement'
              ? 'text-[#E61A6B] border-b-2 border-[#E61A6B]'
              : 'text-[#66666E] hover:text-[#1F1F24]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Top Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'categories'
              ? 'text-[#E61A6B] border-b-2 border-[#E61A6B]'
              : 'text-[#66666E] hover:text-[#1F1F24]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category Rail Cards ({categories.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HERO CAROUSEL STUDIO */}
      {/* ======================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F1F24]">Select Slide:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {slides.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                      selectedSlideIndex === idx
                        ? 'bg-[#1F1F24] text-[#D4AF37] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#66666E] hover:bg-[#F0ECE1]'
                    }`}
                  >
                    Slide #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddSlide}
                className="btn-gold-outline px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetSection('hero_slides')}
                disabled={isSaving}
                className="px-3 py-1.5 rounded text-xs font-semibold text-[#8E8E98] hover:text-[#1F1F24] flex items-center gap-1.5 hover:bg-[#FAF8F5] transition-colors"
                title="Restore default festive slides"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveHero}
                disabled={isSaving}
                className="btn-rani px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Publishing...' : 'Publish Hero Slides'}</span>
              </button>
            </div>
          </div>

          {/* Live Hero Card Interactive Preview */}
          <div className="bg-[#1F1F24] rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-lg text-white">
            <div className="bg-[#18181C] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E61A6B] animate-pulse" />
                <span className="font-semibold text-white">Live Storefront Carousel Mockup</span>
              </div>
              <span className="font-mono text-[11px] text-[#D4AF37]">
                Previewing Slide {selectedSlideIndex + 1} of {slides.length}
              </span>
            </div>

            <div className="relative h-[340px] sm:h-[400px] w-full">
              {currentSlide.image ? (
                <Image
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#2C2C34] flex items-center justify-center text-white/50 text-xs">
                  No image selected
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F24] via-[#1F1F24]/80 to-transparent" />

              <div className="relative max-w-2xl h-full p-6 sm:p-10 flex flex-col justify-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1F1F24] border border-[#D4AF37] rounded text-white text-[10px] font-bold uppercase tracking-widest w-fit">
                  <Sparkles className="w-3 h-3 text-[#F3A712]" />
                  <span>{currentSlide.tag || 'TAG'}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                  {currentSlide.title || 'Slide Title'}
                </h2>
                <p className="font-serif text-sm sm:text-lg text-[#D4AF37] italic">
                  {currentSlide.subtitle || 'Slide Subtitle'}
                </p>
                <p className="text-xs text-white/80 line-clamp-2 max-w-md">
                  {currentSlide.description || 'Description text goes here...'}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <span className="btn-rani px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider">
                    {currentSlide.ctaPrimaryText || 'Primary CTA'}
                  </span>
                  <span className="btn-gold-outline px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-[#D4AF37]" />
                    {currentSlide.ctaSecondaryText || 'Secondary CTA'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Editor Form */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E2DC] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                <span>Edit Slide #{selectedSlideIndex + 1}</span>
                <span className="text-xs font-normal text-[#66666E]">({currentSlide.title})</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveSlide(selectedSlideIndex, 'up')}
                  disabled={selectedSlideIndex === 0}
                  className="p-1.5 rounded border border-[#E5E2DC] text-[#66666E] hover:text-[#1F1F24] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move slide up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSlide(selectedSlideIndex, 'down')}
                  disabled={selectedSlideIndex === slides.length - 1}
                  className="p-1.5 rounded border border-[#E5E2DC] text-[#66666E] hover:text-[#1F1F24] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move slide down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(selectedSlideIndex)}
                  className="p-1.5 rounded border border-[#990000]/30 text-[#990000] hover:bg-[#990000]/10 transition-colors"
                  title="Delete slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Headings & Copy */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Slide Headline Title *
                  </label>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={(e) => handleSlideChange(selectedSlideIndex, 'title', e.target.value)}
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. Festive Luxury '26"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Subtitle (Italic Golden Callout) *
                  </label>
                  <input
                    type="text"
                    value={currentSlide.subtitle}
                    onChange={(e) => handleSlideChange(selectedSlideIndex, 'subtitle', e.target.value)}
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. Chiffon, Raw Silk & Handcrafted Zardozi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Slide Tag Badge *
                  </label>
                  <input
                    type="text"
                    value={currentSlide.tag}
                    onChange={(e) => handleSlideChange(selectedSlideIndex, 'tag', e.target.value)}
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. NEW SEASON DROP, WINTER COUTURE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Editorial Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={currentSlide.description}
                    onChange={(e) => handleSlideChange(selectedSlideIndex, 'description', e.target.value)}
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="Short description highlight for the dress & craftsmanship..."
                  />
                </div>
              </div>

              {/* Right Column: CTAs & Image */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                      Primary CTA Text
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaPrimaryText}
                      onChange={(e) => handleSlideChange(selectedSlideIndex, 'ctaPrimaryText', e.target.value)}
                      className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                      placeholder="e.g. Shop Ready to Wear"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaPrimaryLink}
                      onChange={(e) => handleSlideChange(selectedSlideIndex, 'ctaPrimaryLink', e.target.value)}
                      className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                      placeholder="/shop?category=ready-to-wear"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                      Secondary CTA Text
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaSecondaryText || ''}
                      onChange={(e) => handleSlideChange(selectedSlideIndex, 'ctaSecondaryText', e.target.value)}
                      className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                      placeholder="e.g. Custom Silai Atelier"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaSecondaryLink || ''}
                      onChange={(e) => handleSlideChange(selectedSlideIndex, 'ctaSecondaryLink', e.target.value)}
                      className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                      placeholder="/custom-stitching"
                    />
                  </div>
                </div>

                {/* Banner Photo Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Banner Background Image (2000×1000px Recommended)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentSlide.image}
                      onChange={(e) => handleSlideChange(selectedSlideIndex, 'image', e.target.value)}
                      className="flex-1 text-xs font-mono border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                      placeholder="https://... or upload below"
                    />
                  </div>

                  <label className="border-2 border-dashed border-[#D4AF37]/50 hover:border-[#E61A6B] rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer bg-[#FAF8F5] transition-colors">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-semibold text-[#1F1F24]">
                      {isUploading ? 'Uploading to Supabase CDN...' : 'Upload New Banner Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSlideImageUpload(file, selectedSlideIndex);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TOP ANNOUNCEMENT TICKER */}
      {/* ======================================================== */}
      {activeTab === 'announcement' && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-xs">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A5C36]"></div>
              </label>
              <span className="text-xs font-bold text-[#1F1F24]">
                {announcement.enabled ? 'Announcement Bar Active on Website' : 'Announcement Bar Disabled (Hidden)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetSection('announcement_bar')}
                disabled={isSaving}
                className="px-3 py-1.5 rounded text-xs font-semibold text-[#8E8E98] hover:text-[#1F1F24] flex items-center gap-1.5 hover:bg-[#FAF8F5] transition-colors"
                title="Restore default announcement"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={isSaving}
                className="btn-rani px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Publishing...' : 'Publish Announcement'}</span>
              </button>
            </div>
          </div>

          {/* Live Bar Mockup */}
          <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#E5E2DC]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66666E] block mb-3">
              Live Customer View Preview:
            </span>

            {announcement.enabled ? (
              <div className="bg-[#1F1F24] text-[#FAF8F5] text-xs font-medium py-2.5 px-4 rounded border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="w-3.5 h-3.5 text-[#E61A6B]" />
                  <span>VIP Helpline:</span>
                  <span className="text-[#D4AF37] font-semibold font-mono">
                    +{announcement.whatsappNumber || '923000000000'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-center text-white/90">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3A712] shrink-0" />
                  <span>{announcement.primaryMessage}</span>
                  {announcement.secondaryMessage && (
                    <>
                      <span className="text-white/40 hidden sm:inline">•</span>
                      <span className="text-white/70 hidden sm:inline">{announcement.secondaryMessage}</span>
                    </>
                  )}
                </div>

                {announcement.promoCode && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B2B33] border border-[#D4AF37] rounded text-[#D4AF37] font-mono text-[10px] font-bold">
                    <span>CODE:</span>
                    <span>{announcement.promoCode}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center text-xs text-gray-500 italic">
                Announcement bar is currently toggled OFF. It will not render on the customer storefront.
              </div>
            )}
          </div>

          {/* Announcement Form */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E2DC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1F1F24] border-b border-[#E5E2DC] pb-3">
              Announcement Content & Helpline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Primary Marquee Message *
                  </label>
                  <input
                    type="text"
                    value={announcement.primaryMessage}
                    onChange={(e) =>
                      setAnnouncement((prev) => ({ ...prev, primaryMessage: e.target.value }))
                    }
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. Free Delivery across Pakistan on all orders above Rs. 4,999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Secondary Operational Message
                  </label>
                  <input
                    type="text"
                    value={announcement.secondaryMessage || ''}
                    onChange={(e) =>
                      setAnnouncement((prev) => ({ ...prev, secondaryMessage: e.target.value }))
                    }
                    className="w-full text-xs font-medium border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. 7–10 Days Master Bespoke Tailoring | Worldwide Express Dispatch"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    Active Promo Code Banner Tag
                  </label>
                  <input
                    type="text"
                    value={announcement.promoCode || ''}
                    onChange={(e) =>
                      setAnnouncement((prev) => ({ ...prev, promoCode: e.target.value }))
                    }
                    className="w-full text-xs font-mono font-bold uppercase border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="e.g. FESTIVE10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1">
                    WhatsApp Helpline Number (Without +)
                  </label>
                  <input
                    type="text"
                    value={announcement.whatsappNumber || ''}
                    onChange={(e) =>
                      setAnnouncement((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                    }
                    className="w-full text-xs font-mono border border-[#E5E2DC] rounded-lg px-3 py-2 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="923000000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CATEGORY RAIL CARDS */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-xs">
            <span className="text-xs font-bold text-[#1F1F24]">
              {categories.length} Circular Highlight Cards Displayed on Customer Homepage
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn-gold-outline px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetSection('category_cards')}
                disabled={isSaving}
                className="px-3 py-1.5 rounded text-xs font-semibold text-[#8E8E98] hover:text-[#1F1F24] flex items-center gap-1.5 hover:bg-[#FAF8F5] transition-colors"
                title="Restore default categories"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCategories}
                disabled={isSaving}
                className="btn-rani px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Publishing...' : 'Publish Category Rail'}</span>
              </button>
            </div>
          </div>

          {/* Live Circular Mockup */}
          <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#E5E2DC]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66666E] block mb-4">
              Live Circular Preview on Storefront:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="flex flex-col items-center text-center select-none">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 border-2 border-[#D4AF37]/50 bg-white shadow-xs">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#1F1F24] mt-2">
                    {cat.title}
                  </h4>
                  <span className="text-[10px] text-[#66666E]">
                    {cat.subtitle || cat.slug}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Cards List Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.id || idx}
                className="bg-white rounded-xl p-4 border border-[#E5E2DC] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-2">
                  <span className="text-xs font-bold text-[#1F1F24]">Category #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(idx)}
                    className="p-1 rounded text-[#990000] hover:bg-[#990000]/10 transition-colors"
                    title="Remove Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-full border border-[#D4AF37] overflow-hidden shrink-0 bg-[#FAF8F5]">
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1F1F24] uppercase tracking-wider mb-0.5">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => handleCategoryChange(idx, 'title', e.target.value)}
                        className="w-full text-xs font-medium border border-[#E5E2DC] rounded px-2 py-1 focus:border-[#E61A6B] focus:outline-none"
                        placeholder="e.g. Unstitched Luxury"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#1F1F24] uppercase tracking-wider mb-0.5">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={cat.subtitle || ''}
                          onChange={(e) => handleCategoryChange(idx, 'subtitle', e.target.value)}
                          className="w-full text-xs font-medium border border-[#E5E2DC] rounded px-2 py-1 focus:border-[#E61A6B] focus:outline-none"
                          placeholder="Pure Lawn & Silk"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#1F1F24] uppercase tracking-wider mb-0.5">
                          Link Slug
                        </label>
                        <input
                          type="text"
                          value={cat.slug}
                          onChange={(e) => handleCategoryChange(idx, 'slug', e.target.value)}
                          className="w-full text-xs font-medium border border-[#E5E2DC] rounded px-2 py-1 focus:border-[#E61A6B] focus:outline-none"
                          placeholder="unstitched"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload for Category */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={cat.image}
                    onChange={(e) => handleCategoryChange(idx, 'image', e.target.value)}
                    className="flex-1 text-[11px] font-mono border border-[#E5E2DC] rounded px-2 py-1 focus:border-[#E61A6B] focus:outline-none"
                    placeholder="Image URL"
                  />
                  <label className="px-2.5 py-1 bg-[#FAF8F5] border border-[#D4AF37]/60 hover:border-[#E61A6B] text-[11px] font-semibold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3 text-[#D4AF37]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCategoryImageUpload(file, idx);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
