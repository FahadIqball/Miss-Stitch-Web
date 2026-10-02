'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, StitchingMode, StandardSize, ShirtLengthOption, TrouserStyle, CustomMeasurements, FinishingAddons } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useVaultStore } from '@/store/useVaultStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import {
  Scissors,
  Ruler,
  ShoppingBag,
  Heart,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers,
  ZoomIn,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

const TROUSER_STYLES: { id: TrouserStyle; label: string; desc: string }[] = [
  { id: 'cigarette', label: 'Cigarette Pants', desc: 'Modern tapered ankle length' },
  { id: 'loose_shalwar', label: 'Loose Shalwar', desc: 'Traditional classic pleats' },
  { id: 'tulip_shalwar', label: 'Tulip Shalwar', desc: 'Festive overlapping curved hem' },
  { id: 'bell_bottom', label: 'Bell Bottom', desc: 'Flared retro formal style' },
  { id: 'straight_trouser', label: 'Straight Trouser', desc: 'Comfortable relaxed straight cut' },
];

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { profiles } = useVaultStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openSizeChartModal, openCartDrawer } = useUIStore();

  const inWishlist = isInWishlist(product.id);

  // Gallery state
  const allImages = [
    product.images.primary,
    ...(product.images.secondary ? [product.images.secondary] : []),
    ...(product.images.gallery || []),
    ...(product.images.embroideryCloseUp ? [product.images.embroideryCloseUp] : []),
  ];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Stitching Configurator State
  const [stitchingMode, setStitchingMode] = useState<StitchingMode>('unstitched');
  const [standardSize, setStandardSize] = useState<StandardSize>('M');
  const [shirtLength, setShirtLength] = useState<ShirtLengthOption>('standard_42');

  // Custom Measurements State
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [customMeasurements, setCustomMeasurements] = useState<CustomMeasurements>({
    shirtLength: 43,
    chest: 38,
    waist: 32,
    hips: 41,
    shoulder: 14.5,
    sleeveLength: 21.5,
    armhole: 8.5,
    neckDepth: 7,
    trouserLength: 38,
    trouserStyle: 'cigarette',
  });

  // Finishing Addons State
  const [addons, setAddons] = useState<FinishingAddons>({
    attachedLining: false,
    edgeFinishingTassels: false,
    sleevesLining: false,
  });

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Accordions State
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    boxContents: true,
    tailoringTimeline: false,
    fabricCare: false,
    returns: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Profile Autofill Handler
  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    const found = profiles.find((p) => p.id === profileId);
    if (found) {
      setCustomMeasurements({ ...found.measurements });
    }
  };

  // Fee Calculations
  const stitchingFee =
    stitchingMode === 'unstitched'
      ? 0
      : stitchingMode === 'standard'
      ? product.standardStitchingFeePKR
      : product.customStitchingFeePKR;

  const addonsFee =
    (addons.attachedLining ? 1000 : 0) +
    (addons.edgeFinishingTassels ? 800 : 0) +
    (addons.sleevesLining ? 500 : 0);

  const unitTotalPKR = product.basePricePKR + stitchingFee + addonsFee;
  const grandTotalPKR = unitTotalPKR * quantity;

  // Add to Bag Handler
  const handleAddToBag = () => {
    addItem({
      productId: product.id,
      title: product.title,
      collection: product.collection,
      thumbnail: product.images.primary,
      basePricePKR: product.basePricePKR,
      stitchingMode,
      standardSize: stitchingMode === 'standard' ? standardSize : undefined,
      shirtLengthOption: stitchingMode === 'standard' ? shirtLength : undefined,
      customMeasurements: stitchingMode === 'custom' ? customMeasurements : undefined,
      savedProfileName:
        stitchingMode === 'custom' && selectedProfileId
          ? profiles.find((p) => p.id === selectedProfileId)?.name
          : undefined,
      addons,
      stitchingFeePKR: stitchingFee,
      addonsFeePKR: addonsFee,
      unitTotalPKR,
      quantity,
    });
    openCartDrawer();
  };

  // WhatsApp Order Handler
  const generateWhatsAppMessage = () => {
    const modeText =
      stitchingMode === 'unstitched'
        ? 'Unstitched Fabric'
        : stitchingMode === 'standard'
        ? `Standard Stitched (Size: ${standardSize}, Length: ${shirtLength === 'long_46' ? '46" Long' : '42" Standard'})`
        : `Custom Made-to-Measure (Chest: ${customMeasurements.chest}", Waist: ${customMeasurements.waist}", Shirt Length: ${customMeasurements.shirtLength}", Trouser: ${customMeasurements.trouserStyle})`;

    const text = encodeURIComponent(
      `*Salam Miss Stitch!*\nI would like to order this suit via WhatsApp:\n\n` +
      `👗 *Suit:* ${product.title}\n` +
      `🏷️ *SKU:* ${product.sku}\n` +
      `✂️ *Stitching Mode:* ${modeText}\n` +
      `💰 *Total Price:* Rs. ${grandTotalPKR.toLocaleString('en-PK')}\n\n` +
      `Please confirm stock availability and bank/COD details.`
    );
    return `https://wa.me/923000000000?text=${text}`;
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-6">
          <Link href="/" className="hover:text-[#E61A6B]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#E61A6B]">Catalog</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main PDP Grid: 60% Left Gallery, 40% Right Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side: Media Gallery (7 Cols ~ 58-60%) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image Preview */}
            <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-[#E5E2DC] shadow-sm">
              <Image
                src={allImages[selectedImageIndex] || product.images.primary}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* Status Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="bg-[#0A5C36] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                  {product.pieceCount} • {product.fabric}
                </span>
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#1F1F24] text-[#D4AF37] border border-[#D4AF37]/60 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full z-10 shadow-md transition-all ${
                  inWishlist
                    ? 'bg-[#E61A6B] text-white'
                    : 'bg-white/95 text-[#1F1F24] hover:text-[#E61A6B]'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>

              {/* 4K Embroidery Zoom Badge */}
              <div className="absolute bottom-4 left-4 bg-[#1F1F24]/90 text-[#FAF8F5] text-[11px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 border border-white/20">
                <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>4K Zardozi & Hand Embroidery View</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-white transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#E61A6B] shadow-md scale-102'
                      : 'border-[#E5E2DC] opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Product Details & 3-Way Stitching Engine (5 Cols ~ 40-42%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Info */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#66666E] font-bold uppercase tracking-wider mb-1">
                <div className="flex items-center gap-2">
                  <span>{product.collection}</span>
                  {!product.inStock && (
                    <span className="px-2 py-0.5 bg-[#9E182B] text-white text-[10px] uppercase font-bold tracking-wider rounded">
                      Sold Out
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px]">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24] leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-[#0A5C36] font-bold">★ {product.rating}</span>
                <span className="text-[#66666E]">({product.reviewCount} Verified Reviews)</span>
                <span className="text-[#66666E]">•</span>
                <span className="text-[#0A5C36] font-semibold">100% Original Brand Fabric</span>
              </div>

              {/* Dynamic Base Price Display */}
              <div className="mt-4 pt-4 border-t border-[#E5E2DC] flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-[#66666E] uppercase font-bold tracking-wider block">
                    Base Unstitched Price
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#1F1F24]">
                    {formatPrice(product.basePricePKR)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-[#0A5C36]/10 text-[#0A5C36] text-xs font-bold rounded">
                    Free Delivery Qualified
                  </span>
                </div>
              </div>
            </div>

            {/* THE 3-WAY STITCHING ENGINE CONFIGURATOR */}
            <div className="bg-white border-2 border-[#D4AF37]/50 rounded-xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#E61A6B]" />
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1F24]">
                    Step 1: Choose Stitching Mode
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={openSizeChartModal}
                  className="text-xs text-[#E61A6B] font-bold hover:underline flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              {/* 3 Radio Mode Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* Option 1: Unstitched Fabric */}
                <label
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    stitchingMode === 'unstitched'
                      ? 'border-[#E61A6B] bg-[#FAF5E6] shadow-xs'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="stitchingMode"
                      checked={stitchingMode === 'unstitched'}
                      onChange={() => setStitchingMode('unstitched')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <span className="font-bold text-sm text-[#1F1F24] block">
                        Unstitched Fabric (No Stitching)
                      </span>
                      <span className="text-xs text-[#66666E] block mt-0.5">
                        Cut fabric pieces, embroidered gala, daman borders & dupatta patches.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1F1F24] shrink-0">
                    Included
                  </span>
                </label>

                {/* Option 2: Standard Stitched */}
                <label
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    stitchingMode === 'standard'
                      ? 'border-[#E61A6B] bg-[#FAF5E6] shadow-xs'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="stitchingMode"
                      checked={stitchingMode === 'standard'}
                      onChange={() => setStitchingMode('standard')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <span className="font-bold text-sm text-[#1F1F24] block">
                        Standard Stitched Ready-to-Wear
                      </span>
                      <span className="text-xs text-[#66666E] block mt-0.5">
                        Standard XS–XXL fitting + Choice of 42&quot; Standard or 46&quot; Long shirt length.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0A5C36] shrink-0">
                    +{formatPrice(product.standardStitchingFeePKR)}
                  </span>
                </label>

                {/* Option 3: Custom Made-to-Measure */}
                <label
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    stitchingMode === 'custom'
                      ? 'border-[#E61A6B] bg-[#FAF5E6] shadow-xs'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="stitchingMode"
                      checked={stitchingMode === 'custom'}
                      onChange={() => setStitchingMode('custom')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#1F1F24]">
                          Custom Made-to-Measure (Bespoke Silai)
                        </span>
                        <span className="bg-[#E61A6B] text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                          VIP Fit
                        </span>
                      </div>
                      <span className="text-xs text-[#66666E] block mt-0.5">
                        Provide custom inch measurements (chest, waist, hips) & select trouser cut.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0A5C36] shrink-0">
                    +{formatPrice(product.customStitchingFeePKR)}
                  </span>
                </label>
              </div>

              {/* Standard Mode Sub-Controls */}
              {stitchingMode === 'standard' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg space-y-4 animate-in fade-in">
                  <div>
                    <span className="text-xs font-bold text-[#1F1F24] block mb-2">
                      Select Standard Size:
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as StandardSize[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setStandardSize(sz)}
                          className={`py-2 text-xs font-bold rounded border transition-all ${
                            standardSize === sz
                              ? 'bg-[#1F1F24] text-white border-[#1F1F24] shadow-xs'
                              : 'bg-white text-[#1F1F24] border-[#E5E2DC] hover:border-[#D4AF37]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F1F24]">
                      Shirt Length Preference:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShirtLength('standard_42')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                          shirtLength === 'standard_42'
                            ? 'bg-[#FAF5E6] border-[#D4AF37] text-[#1F1F24] font-bold'
                            : 'bg-white border-[#E5E2DC] text-[#66666E]'
                        }`}
                      >
                        Standard 42&quot;
                      </button>
                      <button
                        type="button"
                        onClick={() => setShirtLength('long_46')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                          shirtLength === 'long_46'
                            ? 'bg-[#FAF5E6] border-[#D4AF37] text-[#1F1F24] font-bold'
                            : 'bg-white border-[#E5E2DC] text-[#66666E]'
                        }`}
                      >
                        Long 46&quot;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Made-to-Measure Sub-Controls */}
              {stitchingMode === 'custom' && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg space-y-4 animate-in fade-in">
                  {/* Sizing Vault Autofill Bar */}
                  {profiles.length > 0 && (
                    <div className="p-2.5 bg-white border border-[#D4AF37]/50 rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#1F1F24] font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#E61A6B]" />
                        <span>Autofill from Sizing Vault:</span>
                      </div>
                      <select
                        value={selectedProfileId}
                        onChange={(e) => handleProfileSelect(e.target.value)}
                        className="bg-[#FAF8F5] border border-[#E5E2DC] rounded px-2 py-1 text-xs text-[#1F1F24] font-semibold focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="">Choose Saved Profile...</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Inch Measurement Input Grid */}
                  <div>
                    <span className="text-xs font-bold text-[#1F1F24] block mb-2">
                      Body Measurements (Garment Dimensions in Inches):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Shirt Length (in)</label>
                        <input
                          type="number"
                          value={customMeasurements.shirtLength}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              shirtLength: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Chest (in)</label>
                        <input
                          type="number"
                          value={customMeasurements.chest}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              chest: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Waist (in)</label>
                        <input
                          type="number"
                          value={customMeasurements.waist}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              waist: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Hips (in)</label>
                        <input
                          type="number"
                          value={customMeasurements.hips}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              hips: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Shoulder (in)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={customMeasurements.shoulder}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              shoulder: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Sleeve Length (in)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={customMeasurements.sleeveLength}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              sleeveLength: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#66666E] mb-0.5">Trouser Length (in)</label>
                        <input
                          type="number"
                          value={customMeasurements.trouserLength}
                          onChange={(e) =>
                            setCustomMeasurements((prev) => ({
                              ...prev,
                              trouserLength: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-[#E5E2DC] rounded p-1.5 font-mono text-center font-bold text-[#1F1F24]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trouser Cut Selector */}
                  <div className="pt-3 border-t border-[#E5E2DC]">
                    <span className="text-xs font-bold text-[#1F1F24] block mb-2">
                      Select Trouser Stitching Cut:
                    </span>
                    <div className="space-y-1.5">
                      {TROUSER_STYLES.map((style) => (
                        <label
                          key={style.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-colors ${
                            customMeasurements.trouserStyle === style.id
                              ? 'bg-white border-[#E61A6B] font-bold text-[#1F1F24]'
                              : 'bg-white/50 border-[#E5E2DC] text-[#66666E] hover:border-[#D4AF37]'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <input
                              type="radio"
                              name="trouserStyle"
                              checked={customMeasurements.trouserStyle === style.id}
                              onChange={() =>
                                setCustomMeasurements((prev) => ({
                                  ...prev,
                                  trouserStyle: style.id,
                                }))
                              }
                              className="accent-[#E61A6B]"
                            />
                            <span>{style.label}</span>
                          </div>
                          <span className="text-[10px] text-[#66666E]">{style.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: FINISHING ADD-ONS */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <h4 className="font-serif text-base font-bold text-[#1F1F24] mb-3">
                  Step 2: Luxury Finishing Add-Ons
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={addons.attachedLining}
                        onChange={(e) =>
                          setAddons((prev) => ({ ...prev, attachedLining: e.target.checked }))
                        }
                        className="accent-[#E61A6B] w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1F1F24] block">
                          Attached Pure Cotton / Silk Lining (Shameez)
                        </span>
                        <span className="text-[11px] text-[#66666E]">
                          Soft, breathable inner slip stitched inside shirt body.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0A5C36] shrink-0">
                      +{formatPrice(1000)}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={addons.edgeFinishingTassels}
                        onChange={(e) =>
                          setAddons((prev) => ({
                            ...prev,
                            edgeFinishingTassels: e.target.checked,
                          }))
                        }
                        className="accent-[#E61A6B] w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1F1F24] block">
                          Dupatta Edge Finishing, Pico & Latkan Tassels
                        </span>
                        <span className="text-[11px] text-[#66666E]">
                          Fine silk patti piping, corner tassels, and neat overlock.
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0A5C36] shrink-0">
                      +{formatPrice(800)}
                    </span>
                  </label>
                </div>
              </div>

              {/* LIVE DYNAMIC PRICE BREAKDOWN */}
              <div className="bg-[#FAF5E6] border border-[#D4AF37]/60 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#66666E]">
                  <span>Base Suit Fabric:</span>
                  <span className="font-mono text-[#1F1F24]">{formatPrice(product.basePricePKR)}</span>
                </div>
                {stitchingFee > 0 && (
                  <div className="flex justify-between text-[#66666E]">
                    <span>
                      {stitchingMode === 'standard' ? 'Standard Stitching:' : 'Bespoke Made-to-Measure Silai:'}
                    </span>
                    <span className="font-mono text-[#0A5C36] font-bold">+{formatPrice(stitchingFee)}</span>
                  </div>
                )}
                {addonsFee > 0 && (
                  <div className="flex justify-between text-[#66666E]">
                    <span>Finishing Add-ons (Lining/Tassels):</span>
                    <span className="font-mono text-[#0A5C36] font-bold">+{formatPrice(addonsFee)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#D4AF37]/40 flex justify-between items-baseline font-bold text-sm text-[#1F1F24]">
                  <span>Unit Total:</span>
                  <span className="font-mono text-xl text-[#E61A6B]">{formatPrice(unitTotalPKR)}</span>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E5E2DC] rounded bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-xs font-bold text-[#66666E] hover:text-[#1F1F24]"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-bold font-mono text-[#1F1F24]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-xs font-bold text-[#66666E] hover:text-[#1F1F24]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToBag}
                    disabled={!product.inStock}
                    className={`flex-1 py-3.5 rounded text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                      product.inStock
                        ? 'btn-rani'
                        : 'bg-[#D1D1D6] text-[#66666E] cursor-not-allowed shadow-none'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {product.inStock
                        ? `Add to Bag — ${formatPrice(grandTotalPKR)}`
                        : 'Sold Out / Out of Stock'}
                    </span>
                  </button>
                </div>

                {/* Direct WhatsApp Order CTA */}
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#0A5C36] text-white hover:bg-[#074729] text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>
                    {product.inStock
                      ? 'Order Directly via WhatsApp'
                      : 'Inquire About Restock on WhatsApp'}
                  </span>
                </a>
              </div>
            </div>

            {/* ACCORDION TABS */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-xs divide-y divide-[#E5E2DC] text-xs">
              {/* Box Contents */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('boxContents')}
                  className="w-full p-4 flex items-center justify-between font-bold text-[#1F1F24] hover:bg-[#FAF8F5] text-left"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>Box Contents & Fabric Specifications</span>
                  </div>
                  {openAccordions.boxContents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.boxContents && (
                  <div className="p-4 bg-[#FAF8F5] text-[#66666E] space-y-2 border-t border-[#E5E2DC]">
                    <p><strong>Shirt:</strong> {product.boxContents.shirt}</p>
                    <p><strong>Dupatta:</strong> {product.boxContents.dupatta}</p>
                    <p><strong>Trouser:</strong> {product.boxContents.trouser}</p>
                    <div>
                      <strong className="block text-[#1F1F24] mb-1">Embroidered Patches & Borders:</strong>
                      <ul className="list-disc pl-4 space-y-1">
                        {product.boxContents.embroideryPatches.map((patch, idx) => (
                          <li key={idx}>{patch}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Tailoring & Dispatch Timeline */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('tailoringTimeline')}
                  className="w-full p-4 flex items-center justify-between font-bold text-[#1F1F24] hover:bg-[#FAF8F5] text-left"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0A5C36]" />
                    <span>Tailoring Turnaround & Nationwide Delivery</span>
                  </div>
                  {openAccordions.tailoringTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.tailoringTimeline && (
                  <div className="p-4 bg-[#FAF8F5] text-[#66666E] space-y-2 border-t border-[#E5E2DC]">
                    <p>• <strong>Unstitched Fabric:</strong> Dispatched within 24–48 hours via TCS / Leopards Courier.</p>
                    <p>• <strong>Standard & Bespoke Custom Silai:</strong> Stitched, finished with shameez/pico, and dispatched in <strong>7–10 working days</strong>.</p>
                    <p>• <strong>Worldwide Delivery:</strong> DHL International Express to UK, UAE, USA, Canada in 4–7 business days.</p>
                  </div>
                )}
              </div>

              {/* Care & Dry Cleaning */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('fabricCare')}
                  className="w-full p-4 flex items-center justify-between font-bold text-[#1F1F24] hover:bg-[#FAF8F5] text-left"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#D4AF37]" />
                    <span>Fabric Care & Maintenance</span>
                  </div>
                  {openAccordions.fabricCare ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.fabricCare && (
                  <div className="p-4 bg-[#FAF8F5] text-[#66666E] space-y-1.5 border-t border-[#E5E2DC]">
                    <p>• Dry clean recommended for heavy chiffon, velvet, and organza suits with zardozi embroideries.</p>
                    <p>• Do not use bleach or stain-removing chemicals.</p>
                    <p>• Iron at moderate temperature on reverse side of embroidery.</p>
                  </div>
                )}
              </div>

              {/* 7-Day Exchange */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('returns')}
                  className="w-full p-4 flex items-center justify-between font-bold text-[#1F1F24] hover:bg-[#FAF8F5] text-left"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#E61A6B]" />
                    <span>7-Day Return & Stitching Warranty Policy</span>
                  </div>
                  {openAccordions.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.returns && (
                  <div className="p-4 bg-[#FAF8F5] text-[#66666E] space-y-1.5 border-t border-[#E5E2DC]">
                    <p>• Unstitched suits can be returned or exchanged within 7 days in original condition.</p>
                    <p>• Custom-stitched items are backed by our <strong>100% Fit Guarantee</strong> — free alterations provided if measurements deviate from submitted metrics.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
