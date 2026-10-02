'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { X, Ruler, HelpCircle, CheckCircle2 } from 'lucide-react';

const SIZE_DATA = [
  { size: 'XS', chest: 34, waist: 28, hips: 37, shoulder: 13.5, sleeve: 20.5, lengthStd: 42, lengthLong: 46, trouser: 37 },
  { size: 'S',  chest: 36, waist: 30, hips: 39, shoulder: 14.0, sleeve: 21.0, lengthStd: 42, lengthLong: 46, trouser: 38 },
  { size: 'M',  chest: 38, waist: 32, hips: 41, shoulder: 14.5, sleeve: 21.5, lengthStd: 42, lengthLong: 46, trouser: 38 },
  { size: 'L',  chest: 41, waist: 35, hips: 44, shoulder: 15.0, sleeve: 22.0, lengthStd: 42, lengthLong: 46, trouser: 39 },
  { size: 'XL', chest: 44, waist: 38, hips: 47, shoulder: 15.5, sleeve: 22.5, lengthStd: 42, lengthLong: 46, trouser: 39 },
  { size: 'XXL',chest: 48, waist: 42, hips: 51, shoulder: 16.5, sleeve: 23.0, lengthStd: 42, lengthLong: 46, trouser: 40 },
];

export const SizeChartModal: React.FC = () => {
  const { isSizeChartModalOpen, closeSizeChartModal } = useUIStore();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const convert = (valInInches: number) => {
    if (unit === 'in') return valInInches;
    return (valInInches * 2.54).toFixed(1);
  };

  if (!isSizeChartModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeSizeChartModal}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-3xl bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#D4AF37]/50 p-6 sm:p-8 text-left relative z-10 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E5E2DC]">
            <div>
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#E61A6B]" />
                <h3 className="font-serif text-2xl font-bold text-[#1F1F24]">
                  Miss Stitch Official Size Chart
                </h3>
              </div>
              <p className="text-xs text-[#66666E] mt-1">
                Standard stitched measurements in garment dimensions (Relaxed comfort fit).
              </p>
            </div>
            <button
              type="button"
              onClick={closeSizeChartModal}
              className="p-1.5 rounded-full text-[#66666E] hover:text-[#1F1F24] hover:bg-white"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="my-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F1F24]">
              Measurement Unit:
            </span>
            <div className="flex items-center bg-white border border-[#E5E2DC] rounded p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === 'in'
                    ? 'bg-[#1F1F24] text-white'
                    : 'text-[#66666E] hover:text-[#1F1F24]'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === 'cm'
                    ? 'bg-[#1F1F24] text-white'
                    : 'text-[#66666E] hover:text-[#1F1F24]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-[#E5E2DC] rounded-lg bg-white">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#FAF5E6] border-b border-[#D4AF37]/30 text-[#1F1F24] font-bold">
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Waist</th>
                  <th className="p-3">Hips</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Sleeves</th>
                  <th className="p-3">Shirt Length</th>
                  <th className="p-3">Trouser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] font-medium text-[#1F1F24]">
                {SIZE_DATA.map((row) => (
                  <tr key={row.size} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3 text-left font-bold text-[#E61A6B] bg-[#FAF8F5]">
                      {row.size}
                    </td>
                    <td className="p-3 font-mono">{convert(row.chest)}</td>
                    <td className="p-3 font-mono">{convert(row.waist)}</td>
                    <td className="p-3 font-mono">{convert(row.hips)}</td>
                    <td className="p-3 font-mono">{convert(row.shoulder)}</td>
                    <td className="p-3 font-mono">{convert(row.sleeve)}</td>
                    <td className="p-3 font-mono">
                      {convert(row.lengthStd)}&quot; / {convert(row.lengthLong)}&quot;
                    </td>
                    <td className="p-3 font-mono">{convert(row.trouser)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Guide Callout */}
          <div className="mt-5 p-4 bg-white border border-[#E5E2DC] rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#1F1F24]">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>How to Measure at Home (3 Key Rules)</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#66666E] pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong>Chest:</strong> Measure around the fullest part of bust keeping tape comfortable.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong>Shirt Length:</strong> From highest shoulder point down to desired hemline.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0A5C36] shrink-0 mt-0.5" />
                <span><strong>Custom Made:</strong> Need unique fit? Select &ldquo;Custom Made-to-Measure&rdquo; on PDP!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
