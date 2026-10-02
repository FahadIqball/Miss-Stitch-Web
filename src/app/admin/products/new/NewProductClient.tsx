'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  createProductAction,
  uploadProductImageAction,
  CreateProductInput,
} from '@/app/actions/catalogActions';
import {
  Scissors,
  Upload,
  Layers,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';

const FABRICS = ['Lawn', 'Chiffon', 'Raw Silk', 'Organza', 'Velvet', 'Cotton', 'Jacquard'] as const;
const CATEGORIES = [
  { id: 'festive', label: 'Festive Luxury' },
  { id: 'unstitched', label: 'Unstitched Lawn' },
  { id: 'ready-to-wear', label: 'Pret Ready to Wear' },
  { id: 'velvet', label: 'Velvet Formals' },
  { id: 'co-ords', label: 'Luxury Co-ords' },
] as const;
const PIECE_COUNTS = ['3-Piece', '2-Piece', '1-Piece'] as const;
const OCCASIONS = ['Wedding / Festive', 'Semi-Formal', 'Daily Wear', 'Eid Edit'] as const;

export const NewProductClient: React.FC = () => {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [collection, setCollection] = useState("Festive Luxury '26");
  const [category, setCategory] = useState<'festive' | 'unstitched' | 'ready-to-wear' | 'velvet' | 'co-ords'>('festive');
  const [pieceCount, setPieceCount] = useState<'1-Piece' | '2-Piece' | '3-Piece'>('3-Piece');
  const [fabric, setFabric] = useState<'Lawn' | 'Chiffon' | 'Raw Silk' | 'Organza' | 'Velvet' | 'Cotton' | 'Jacquard'>('Chiffon');
  const [fabricDescription, setFabricDescription] = useState(
    'Pure crinkle chiffon shirt with heavy tilla, threadwork, and zardozi embellishments paired with embroidered organza dupatta and dyed raw silk trouser.'
  );
  const [colorName, setColorName] = useState('Rani Pink & Gold');
  const [colorHex, setColorHex] = useState('#E61A6B');
  const [occasion, setOccasion] = useState<'Daily Wear' | 'Semi-Formal' | 'Wedding / Festive' | 'Eid Edit'>('Wedding / Festive');

  // Pricing
  const [basePricePKR, setBasePricePKR] = useState<number>(16500);
  const [standardStitchingFeePKR, setStandardStitchingFeePKR] = useState<number>(3500);
  const [customStitchingFeePKR, setCustomStitchingFeePKR] = useState<number>(4500);

  // Images
  const [primaryImage, setPrimaryImage] = useState('');
  const [secondaryImage, setSecondaryImage] = useState('');
  const [embroideryCloseUp, setEmbroideryCloseUp] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Image Uploading States
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // Box Contents
  const [shirtMeters, setShirtMeters] = useState('3.25 Meters Embroidered Pure Fabric (Front, Back & Sleeves)');
  const [dupattaMeters, setDupattaMeters] = useState('2.5 Meters Heavy Embroidered Organza Dupatta with 4-Side Laser Cut Border');
  const [trouserMeters, setTrouserMeters] = useState('2.5 Meters Dyed Premium Fabric Trouser');
  const [patches, setPatches] = useState<string[]>([
    'Hand-embellished Front Gala neckline patch with pearl & sitara detailing',
    'Organza Embroidered Daman Front & Back Border (1 Meter each)',
    'Embroidered Sleeve Cuffs & Lace Borders',
  ]);
  const [newPatchInput, setNewPatchInput] = useState('');

  // Badges & Flags
  const [isNew, setIsNew] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [tags, setTags] = useState<string[]>(['Ready to Ship', 'Hand Embroidered']);
  const [tagInput, setTagInput] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle file uploads to Supabase storage
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'primary' | 'secondary' | 'embroidery' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file must be less than 5 MB.');
      return;
    }

    setUploadingSlot(slot);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await uploadProductImageAction(dataUrl, file.name);

      setUploadingSlot(null);

      if (!res.success || !res.url) {
        setErrorMessage(res.error || 'Failed to upload photo to storage.');
        return;
      }

      if (slot === 'primary') setPrimaryImage(res.url);
      else if (slot === 'secondary') setSecondaryImage(res.url);
      else if (slot === 'embroidery') setEmbroideryCloseUp(res.url);
      else if (slot === 'gallery') setGalleryImages((prev) => [...prev, res.url!]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPatch = () => {
    if (!newPatchInput.trim()) return;
    setPatches((prev) => [...prev, newPatchInput.trim()]);
    setNewPatchInput('');
  };

  const handleRemovePatch = (index: number) => {
    setPatches((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Please enter a luxury suit title.');
      return;
    }

    if (!primaryImage) {
      setErrorMessage('Please upload at least the Primary Suit photo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateProductInput = {
      title,
      collection,
      category,
      pieceCount,
      fabric,
      fabricDescription,
      colorName,
      colorHex,
      basePricePKR: Number(basePricePKR),
      standardStitchingFeePKR: Number(standardStitchingFeePKR),
      customStitchingFeePKR: Number(customStitchingFeePKR),
      images: {
        primary: primaryImage,
        secondary: secondaryImage || undefined,
        gallery: galleryImages,
        embroideryCloseUp: embroideryCloseUp || undefined,
      },
      tags,
      occasion,
      boxContents: {
        shirt: shirtMeters,
        dupatta: dupattaMeters,
        trouser: trouserMeters,
        embroideryPatches: patches,
      },
      isNew,
      isBestSeller,
    };

    const res = await createProductAction(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create suit. Please review your inputs.');
      return;
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DC]">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-xs text-[#66666E] hover:text-[#1F1F24] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory Atelier</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <span>Add New Luxury Suit Design</span>
          </h1>
          <p className="text-xs text-[#66666E] mt-0.5">
            Configure fabric composition, bespoke silai pricing, and high-resolution catalog photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-lg border border-[#E5E2DC] text-xs font-semibold text-[#66666E] hover:text-[#1F1F24] bg-white shadow-xs"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-rani px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Publishing to Catalog...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Suit Design</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="flex-1 font-semibold">{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Form (7 cols) & Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* 1. MEDIA & PHOTOGRAPHY STUDIO */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#E61A6B]" />
                <span>1. Atelier Photography & Media Storage</span>
              </h2>
              <span className="text-[10px] text-[#0A5C36] font-bold uppercase">Public Supabase CDN</span>
            </div>

            {/* Primary & Secondary Upload Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Image */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                  Primary Catalog Card Photo *
                </label>
                <div className="relative aspect-[3/4] bg-[#FAF8F5] border-2 border-dashed border-[#D4AF37] rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-4">
                  {primaryImage ? (
                    <>
                      <Image src={primaryImage} alt="Primary preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setPrimaryImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileUpload(e, 'primary')}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-[#D4AF37] mb-2" />
                      <span className="text-xs font-bold text-[#1F1F24]">
                        {uploadingSlot === 'primary' ? 'Uploading...' : 'Upload Front Look'}
                      </span>
                      <span className="text-[10px] text-[#8E8E98] mt-1">Portrait 3:4 (Max 5MB)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Secondary Hover Image */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                  Secondary Hover / Drape View
                </label>
                <div className="relative aspect-[3/4] bg-[#FAF8F5] border-2 border-dashed border-[#E5E2DC] rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-4">
                  {secondaryImage ? (
                    <>
                      <Image src={secondaryImage} alt="Secondary preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setSecondaryImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileUpload(e, 'secondary')}
                        className="hidden"
                      />
                      <Camera className="w-8 h-8 text-[#8E8E98] mb-2" />
                      <span className="text-xs font-bold text-[#1F1F24]">
                        {uploadingSlot === 'secondary' ? 'Uploading...' : 'Upload Back / Dupatta'}
                      </span>
                      <span className="text-[10px] text-[#8E8E98] mt-1">Shows on card hover</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Close-up & Gallery Shots */}
            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-2">
                Editorial Gallery & Embroidery Macro Shots
              </label>
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative w-20 h-24 rounded-lg overflow-hidden border border-[#E5E2DC] bg-white">
                    <Image src={imgUrl} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {galleryImages.length < 4 && (
                  <label className="w-20 h-24 border-2 border-dashed border-[#E5E2DC] hover:border-[#D4AF37] rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileUpload(e, 'gallery')}
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 text-[#8E8E98]" />
                    <span className="text-[9px] font-bold text-[#66666E] mt-1">Add Shot</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 2. CORE SUIT SPECIFICATIONS */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0A5C36]" />
                <span>2. Suit Title, Fabric & Collection</span>
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                Luxury Suit Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gul-e-Noor Embroidered Pure Chiffon 3-Pc"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-xs text-[#1F1F24] focus:outline-none focus:border-[#E61A6B] font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Collection</label>
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="e.g. Festive Luxury '26"
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Fabric Type</label>
                <select
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                >
                  {FABRICS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Piece Count</label>
                <select
                  value={pieceCount}
                  onChange={(e) => setPieceCount(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                >
                  {PIECE_COUNTS.map((pc) => (
                    <option key={pc} value={pc}>
                      {pc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Color Name</label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g. Rani Pink & Gold"
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Color Swatch Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded border border-[#E5E2DC] p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                Fabric & Embellishment Description
              </label>
              <textarea
                rows={3}
                value={fabricDescription}
                onChange={(e) => setFabricDescription(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 3. BESPOKE SILAI & FABRIC PRICING */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#E61A6B]" />
                <span>3. Fabric & Tailoring Fee Structure</span>
              </h2>
              <span className="text-[10px] text-[#0A5C36] font-bold uppercase">All in PKR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Base Unstitched Price *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-[#66666E]">PKR</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={basePricePKR}
                    onChange={(e) => setBasePricePKR(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-12 pr-3 py-2 text-xs font-mono font-bold text-[#1F1F24]"
                  />
                </div>
                <span className="text-[10px] text-[#8E8E98] mt-1 block">Fabric + dupatta unstitched</span>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Standard Stitching Fee
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-[#0A5C36]">+PKR</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={standardStitchingFeePKR}
                    onChange={(e) => setStandardStitchingFeePKR(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-14 pr-3 py-2 text-xs font-mono font-bold text-[#0A5C36]"
                  />
                </div>
                <span className="text-[10px] text-[#8E8E98] mt-1 block">XS, S, M, L, XL, XXL fit</span>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Custom Silai Fee
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-[#E61A6B]">+PKR</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customStitchingFeePKR}
                    onChange={(e) => setCustomStitchingFeePKR(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-14 pr-3 py-2 text-xs font-mono font-bold text-[#E61A6B]"
                  />
                </div>
                <span className="text-[10px] text-[#8E8E98] mt-1 block">Inch-by-inch bespoke fit</span>
              </div>
            </div>
          </div>

          {/* 4. BOX CONTENTS & EMBROIDERY PATCHES */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span>4. Box Contents & Embroidered Patches</span>
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Shirt Specifications</label>
                <input
                  type="text"
                  value={shirtMeters}
                  onChange={(e) => setShirtMeters(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Dupatta Specifications</label>
                <input
                  type="text"
                  value={dupattaMeters}
                  onChange={(e) => setDupattaMeters(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">Trouser Fabric</label>
                <input
                  type="text"
                  value={trouserMeters}
                  onChange={(e) => setTrouserMeters(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-[#1F1F24]"
                />
              </div>

              {/* Patches */}
              <div>
                <label className="block font-bold text-[#1F1F24] mb-2">
                  Embroidered Necklines, Borders & Patches Included
                </label>
                <div className="space-y-2 mb-2">
                  {patches.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded border border-[#E5E2DC]"
                    >
                      <span className="text-xs text-[#1F1F24]">✓ {p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePatch(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Embroidered Organza Ghera Border (1 Meter)"
                    value={newPatchInput}
                    onChange={(e) => setNewPatchInput(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPatch}
                    className="px-4 py-2 bg-[#1F1F24] text-white rounded-lg text-xs font-bold"
                  >
                    + Add Patch
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. TAGS & PROMOTIONAL FLAGS */}
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E61A6B]" />
                <span>5. Storefront Badges & Flags</span>
              </h2>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-[#1F1F24]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="accent-[#E61A6B] w-4 h-4"
                />
                <span>New Season Drop Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4"
                />
                <span>Best Seller Badge</span>
              </label>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/40 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Master Silai Choice, Pure Crinkle Chiffon..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E2DC] text-[#1F1F24] rounded-lg text-xs font-bold hover:bg-[#E5E2DC]"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* RIGHT SIDE: LIVE CATALOG CARD PREVIEW (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66666E]">
                Customer Storefront Live Preview
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#0A5C36] font-bold">
                <Eye className="w-3 h-3" />
                <span>Real-Time Rendering</span>
              </span>
            </div>

            {/* Mock Product Card */}
            <div className="border border-[#E5E2DC] rounded-lg overflow-hidden bg-white shadow-xs max-w-sm mx-auto">
              <div className="relative aspect-[3/4] bg-[#FAF8F5]">
                {primaryImage ? (
                  <Image src={primaryImage} alt={title || 'Suit preview'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8E8E98] text-xs">
                    <Camera className="w-8 h-8 mb-1" />
                    <span>Upload photo to view preview</span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isNew && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E61A6B] text-white">
                      New Drop
                    </span>
                  )}
                  {isBestSeller && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D4AF37] text-[#1F1F24]">
                      Best Seller
                    </span>
                  )}
                  {tags.slice(0, 1).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0A5C36] text-white"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#66666E] font-semibold">
                  <span className="uppercase">{collection || 'Collection'}</span>
                  <span className="px-1.5 py-0.2 bg-[#FAF8F5] border border-[#E5E2DC] rounded text-[#0A5C36]">
                    {fabric} • {pieceCount}
                  </span>
                </div>

                <h4 className="font-serif text-sm font-bold text-[#1F1F24] line-clamp-1">
                  {title || 'Suit Title Preview'}
                </h4>

                <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E2DC]">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#1F1F24]">
                      PKR {basePricePKR.toLocaleString('en-PK')}
                    </span>
                    <span className="text-[10px] text-[#66666E] block">Unstitched Base</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#0A5C36]">
                      PKR {(basePricePKR + standardStitchingFeePKR).toLocaleString('en-PK')}
                    </span>
                    <span className="text-[10px] text-[#66666E] block">Fabric + Stitching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-rani w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Publishing Suit...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Suit to Catalog</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
