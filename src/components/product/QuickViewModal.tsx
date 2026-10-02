'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { PRODUCTS } from '@/data/products';
import { StitchingMode, StandardSize, ShirtLengthOption, FinishingAddons } from '@/types';
import {
  X,
  Scissors,
  Check,
  Ruler,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const {
    isQuickViewModalOpen,
    quickViewProductSlug,
    quickViewProduct,
    closeQuickViewModal,
    openSizeChartModal,
    openCartDrawer,
  } = useUIStore();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const product = quickViewProduct || PRODUCTS.find((p) => p.slug === quickViewProductSlug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [stitchingMode, setStitchingMode] = useState<StitchingMode>('unstitched');
  const [standardSize, setStandardSize] = useState<StandardSize>('M');
  const [shirtLength, setShirtLength] = useState<ShirtLengthOption>('standard_42');
  const [addons, setAddons] = useState<FinishingAddons>({
    attachedLining: false,
    edgeFinishingTassels: false,
    sleevesLining: false,
  });

  if (!isQuickViewModalOpen || !product) return null;

  // Calculation
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

  const totalItemPrice = product.basePricePKR + stitchingFee + addonsFee;

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
      addons,
      stitchingFeePKR: stitchingFee,
      addonsFeePKR: addonsFee,
      unitTotalPKR: totalItemPrice,
      quantity: 1,
    });
    closeQuickViewModal();
    openCartDrawer();
  };

  const allImages = [
    product.images.primary,
    ...(product.images.gallery || []),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeQuickViewModal}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-4xl bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#D4AF37]/50 p-5 sm:p-7 text-left relative z-10 animate-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={closeQuickViewModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#66666E] hover:text-[#1F1F24] hover:bg-white z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Gallery */}
            <div>
              <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden border border-[#E5E2DC] shadow-xs mb-3">
                <Image
                  src={allImages[activeImageIndex] || product.images.primary}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute top-3 left-3 bg-[#0A5C36] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {product.pieceCount}
                </span>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 relative rounded overflow-hidden border-2 shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#E61A6B]'
                        : 'border-[#E5E2DC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Product Details & Quick Configurator */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#66666E] block">
                  {product.collection} • SKU: {product.sku}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1F24] mt-0.5">
                  {product.title}
                </h3>

                <p className="text-xs text-[#66666E] mt-2 leading-relaxed">
                  {product.fabricDescription}
                </p>

                {/* Step 1: Stitching Mode Selector */}
                <div className="mt-4 pt-3 border-t border-[#E5E2DC]">
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-2">
                    Step 1: Choose Stitching Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStitchingMode('unstitched')}
                      className={`p-2 rounded border text-left text-xs transition-all ${
                        stitchingMode === 'unstitched'
                          ? 'border-[#E61A6B] bg-white text-[#1F1F24] shadow-xs'
                          : 'border-[#E5E2DC] bg-[#FAF8F5] text-[#66666E] hover:border-[#D4AF37]'
                      }`}
                    >
                      <span className="font-bold block">Unstitched</span>
                      <span className="text-[10px] text-[#66666E]">Base Fabric</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStitchingMode('standard')}
                      className={`p-2 rounded border text-left text-xs transition-all ${
                        stitchingMode === 'standard'
                          ? 'border-[#E61A6B] bg-white text-[#1F1F24] shadow-xs'
                          : 'border-[#E5E2DC] bg-[#FAF8F5] text-[#66666E] hover:border-[#D4AF37]'
                      }`}
                    >
                      <span className="font-bold block">Standard Silai</span>
                      <span className="text-[10px] text-[#0A5C36] font-semibold">
                        +{formatPrice(product.standardStitchingFeePKR)}
                      </span>
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      onClick={closeQuickViewModal}
                      className="p-2 rounded border border-[#D4AF37] bg-[#FAF5E6] text-left text-xs hover:border-[#E61A6B] transition-all group"
                    >
                      <span className="font-bold block text-[#1F1F24] flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-[#E61A6B]" />
                        <span>Custom Silai</span>
                      </span>
                      <span className="text-[10px] text-[#E61A6B] font-semibold">
                        Full Atelier PDP &rarr;
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Standard Size Options if Selected */}
                {stitchingMode === 'standard' && (
                  <div className="mt-3 p-3 bg-white border border-[#E5E2DC] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#1F1F24]">Select Size:</span>
                      <button
                        type="button"
                        onClick={openSizeChartModal}
                        className="text-[11px] text-[#E61A6B] font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>Size Chart</span>
                      </button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as StandardSize[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setStandardSize(sz)}
                          className={`flex-1 py-1 text-xs font-bold rounded border ${
                            standardSize === sz
                              ? 'bg-[#1F1F24] text-white border-[#1F1F24]'
                              : 'bg-[#FAF8F5] text-[#1F1F24] border-[#E5E2DC] hover:border-[#D4AF37]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E2DC]">
                      <span className="text-[#66666E]">Shirt Length:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShirtLength('standard_42')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            shirtLength === 'standard_42'
                              ? 'bg-[#FAF5E6] border-[#D4AF37] text-[#1F1F24]'
                              : 'border-[#E5E2DC] text-[#66666E]'
                          }`}
                        >
                          Standard 42&quot;
                        </button>
                        <button
                          type="button"
                          onClick={() => setShirtLength('long_46')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            shirtLength === 'long_46'
                              ? 'bg-[#FAF5E6] border-[#D4AF37] text-[#1F1F24]'
                              : 'border-[#E5E2DC] text-[#66666E]'
                          }`}
                        >
                          Long 46&quot;
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Finishing Add-Ons */}
                <div className="mt-3">
                  <label className="block text-xs font-bold text-[#1F1F24] uppercase tracking-wider mb-1.5">
                    Step 2: Finishing Add-Ons (Optional)
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 bg-white border border-[#E5E2DC] rounded cursor-pointer hover:border-[#D4AF37] text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addons.attachedLining}
                          onChange={(e) =>
                            setAddons((prev) => ({ ...prev, attachedLining: e.target.checked }))
                          }
                          className="accent-[#E61A6B] w-4 h-4"
                        />
                        <span className="font-semibold text-[#1F1F24]">
                          Attached Cotton Lining (Shameez)
                        </span>
                      </div>
                      <span className="font-mono text-[#0A5C36] font-bold">
                        +{formatPrice(1000)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2 bg-white border border-[#E5E2DC] rounded cursor-pointer hover:border-[#D4AF37] text-xs">
                      <div className="flex items-center gap-2">
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
                        <span className="font-semibold text-[#1F1F24]">
                          Dupatta Pico & Latkan Tassels
                        </span>
                      </div>
                      <span className="font-mono text-[#0A5C36] font-bold">
                        +{formatPrice(800)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Price & Action Strip */}
              <div className="mt-6 pt-4 border-t border-[#E5E2DC]">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#66666E] font-semibold block">
                      Total Item Price
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#E61A6B]">
                      {formatPrice(totalItemPrice)}
                    </span>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeQuickViewModal}
                    className="text-xs text-[#1F1F24] hover:text-[#E61A6B] font-semibold underline flex items-center gap-1"
                  >
                    <span>Full Product Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    className="btn-rani flex-1 py-3 rounded text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag ({formatPrice(totalItemPrice)})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
