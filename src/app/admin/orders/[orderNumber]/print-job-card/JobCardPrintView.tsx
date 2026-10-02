'use client';

import React from 'react';
import { Printer, ArrowLeft, Scissors } from 'lucide-react';
import Link from 'next/link';

interface Props {
  order: any;
}

export const JobCardPrintView: React.FC<Props> = ({ order }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 font-mono text-[#1F1F24]">
      {/* Print Control Toolbar (Hidden during actual print) */}
      <div className="print:hidden max-w-4xl mx-auto mb-6 p-4 bg-[#FAF5E6] border border-[#D4AF37] rounded-xl flex items-center justify-between">
        <Link
          href={`/admin/orders/${order.orderNumber}`}
          className="flex items-center gap-2 text-xs font-bold text-[#1F1F24] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Detail</span>
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-2.5 bg-[#1F1F24] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black transition-colors cursor-pointer shadow-md"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print Tailor Job Card (Ctrl + P)</span>
        </button>
      </div>

      {/* Printable Sheet (8.5 x 11 Layout) */}
      <div className="max-w-4xl mx-auto border-4 border-black p-8 space-y-6">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              MISS STITCH ATELIER
            </h1>
            <p className="text-sm font-bold tracking-widest uppercase">
              Master Tailor Cutting & Silai Job Card (کارخانہ پرچی)
            </p>
          </div>
          <div className="text-right border-2 border-black p-3 bg-neutral-100">
            <span className="text-xs font-bold uppercase block">Job Card #</span>
            <span className="text-2xl font-black tracking-wider text-black">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Meta Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-2 border-black p-4 text-xs">
          <div>
            <span className="font-bold text-neutral-500 uppercase block">Order Date:</span>
            <span className="font-black text-sm">{order.createdAt}</span>
          </div>
          <div>
            <span className="font-bold text-neutral-500 uppercase block">Client Name:</span>
            <span className="font-black text-sm">{order.shippingAddress?.fullName}</span>
          </div>
          <div>
            <span className="font-bold text-neutral-500 uppercase block">Delivery Destination:</span>
            <span className="font-black text-sm">
              {order.shippingAddress?.city} ({order.shippingAddress?.province})
            </span>
          </div>
          <div>
            <span className="font-bold text-neutral-500 uppercase block">Payment / Courier:</span>
            <span className="font-black text-sm uppercase">
              {order.paymentMethod} • {order.courierPartner}
            </span>
          </div>
        </div>

        {/* Suit Items & Tailoring Specs */}
        {order.items.map((item: any, idx: number) => (
          <div key={item.id || idx} className="border-2 border-black p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <span className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5 mr-2">
                  SUIT #{idx + 1}
                </span>
                <span className="font-black text-lg">{item.title}</span>
              </div>
              <div className="text-right font-black uppercase text-sm">
                Mode: {item.stitchingType} {item.size ? `(${item.size})` : ''}
              </div>
            </div>

            {/* Custom Measurement Matrix (Bespoke Inches) */}
            {item.customSpecs ? (
              <div className="space-y-4">
                <div className="bg-black text-white py-1 px-3 text-xs font-bold uppercase tracking-wider flex justify-between">
                  <span>A. KAMEEZ CUTTING DIMENSIONS (قمیض ناپ)</span>
                  <span>ALL UNITS IN INCHES (&quot;)</span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center border-2 border-black p-3">
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Kameez Length</span>
                    <span className="text-2xl font-black">{item.customSpecs.kameezLength}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Chest (چھاتی)</span>
                    <span className="text-2xl font-black">{item.customSpecs.chest}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Waist (کمر)</span>
                    <span className="text-2xl font-black">{item.customSpecs.waist}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Hips (کولہے)</span>
                    <span className="text-2xl font-black">{item.customSpecs.hips}&quot;</span>
                  </div>

                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Shoulder (تیرا)</span>
                    <span className="text-2xl font-black">{item.customSpecs.shoulder}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Armhole (مڈھا)</span>
                    <span className="text-2xl font-black">{item.customSpecs.armhole || 8.5}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Sleeves (بازو)</span>
                    <span className="text-2xl font-black">{item.customSpecs.sleeveLength}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Daman (دامن)</span>
                    <span className="text-2xl font-black">{item.customSpecs.daman || 24}&quot;</span>
                  </div>
                </div>

                <div className="bg-black text-white py-1 px-3 text-xs font-bold uppercase tracking-wider">
                  B. TROUSER CUTTING DIMENSIONS (شلوار / ٹراؤزر ناپ)
                </div>

                <div className="grid grid-cols-4 gap-3 text-center border-2 border-black p-3">
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Trouser Cut Style</span>
                    <span className="text-sm font-black uppercase">{item.customSpecs.trouserType}</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Length (لمبائی)</span>
                    <span className="text-2xl font-black">{item.customSpecs.trouserLength}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Waist (آسن / نیفہ)</span>
                    <span className="text-2xl font-black">{item.customSpecs.trouserWaist || item.customSpecs.waist}&quot;</span>
                  </div>
                  <div className="border border-black p-2 bg-neutral-50">
                    <span className="text-[11px] block text-neutral-600 font-bold uppercase">Cuff (پانچہ)</span>
                    <span className="text-2xl font-black">{item.customSpecs.trouserCuff || 7.0}&quot;</span>
                  </div>
                </div>

                <div className="bg-black text-white py-1 px-3 text-xs font-bold uppercase tracking-wider">
                  C. STYLING & EMBELLISHMENTS SPECIFICATIONS
                </div>

                <div className="grid grid-cols-2 gap-4 border-2 border-black p-4 text-xs">
                  <div>
                    <span className="font-bold text-neutral-600 block">Gala / Neckline Cut:</span>
                    <span className="font-black text-sm">{item.customSpecs.necklineStyle || 'Round with Slit'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-600 block">Sleeves Styling:</span>
                    <span className="font-black text-sm">{item.customSpecs.sleevesStyle || 'Straight with Lace'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-600 block">Inner Lining (شمِیض):</span>
                    <span className="font-black text-sm">
                      {item.customSpecs.hasShameez ? 'REQUIRED (Attach Pure Cotton Lining)' : 'NONE'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-600 block">Latkan & Tassels (لٹکن):</span>
                    <span className="font-black text-sm">
                      {item.customSpecs.hasLatkan ? 'REQUIRED (Attach Daman & Neck Latkan)' : 'NONE'}
                    </span>
                  </div>
                </div>

                {item.customSpecs.customNotes && (
                  <div className="border-2 border-dashed border-black p-3 text-xs">
                    <span className="font-black uppercase block">SPECIAL WORKSHOP INSTRUCTIONS:</span>
                    <p className="mt-1 font-bold">{item.customSpecs.customNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-black text-xs text-center font-bold">
                Standard Ready-to-Wear Size: {item.size} • No Custom Inching Required
              </div>
            )}
          </div>
        ))}

        {/* Workshop Quality & Sign-Off Matrix */}
        <div className="border-4 border-black p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-center border-b-2 border-black pb-2">
            ATELIER WORKSHOP SIGN-OFF & QUALITY VERIFICATION CHECKLIST
          </div>

          <div className="grid grid-cols-4 gap-4 text-xs text-center pt-2">
            <div className="border-2 border-black p-3 space-y-4">
              <span className="font-black block uppercase">1. Master Cutter</span>
              <div className="w-6 h-6 border-2 border-black mx-auto" />
              <div className="border-t border-black pt-1 text-[10px]">Kataai Sign & Date</div>
            </div>

            <div className="border-2 border-black p-3 space-y-4">
              <span className="font-black block uppercase">2. Silai Master</span>
              <div className="w-6 h-6 border-2 border-black mx-auto" />
              <div className="border-t border-black pt-1 text-[10px]">Silai Sign & Date</div>
            </div>

            <div className="border-2 border-black p-3 space-y-4">
              <span className="font-black block uppercase">3. Finishing & Latkan</span>
              <div className="w-6 h-6 border-2 border-black mx-auto" />
              <div className="border-t border-black pt-1 text-[10px]">Piping / Pico Done</div>
            </div>

            <div className="border-2 border-black p-3 space-y-4">
              <span className="font-black block uppercase">4. QC & Steam Iron</span>
              <div className="w-6 h-6 border-2 border-black mx-auto" />
              <div className="border-t border-black pt-1 text-[10px]">Packed & Ready</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-neutral-500 border-t border-black pt-2">
          MISS STITCH COUTURE • BESPOKE SILAI KARKHANA • CONFIDENTIAL WORKSHOP RECORD
        </div>
      </div>
    </div>
  );
};
