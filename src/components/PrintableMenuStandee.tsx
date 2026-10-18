'use client';

import React from 'react';
import { MenuBusiness } from '@/lib/types';
import { Printer, X, UtensilsCrossed, Phone, QrCode, Sparkles } from 'lucide-react';

interface PrintableMenuStandeeProps {
  business: MenuBusiness;
  qrDataUrl: string;
  menuUrl: string;
  onClose: () => void;
}

export default function PrintableMenuStandee({
  business,
  qrDataUrl,
  menuUrl,
  onClose,
}: PrintableMenuStandeeProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        {/* Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>Printable Restaurant Menu Standee</span>
            </h3>
            <p className="text-xs text-slate-500">
              Print this tent card and place it on your dining tables, bar counter, or entrance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Print Menu Standee
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Standee Preview */}
        <div className="mt-6 flex justify-center">
          <div className="standee-card w-full max-w-sm border-2 border-amber-300 rounded-2xl p-6 bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50 text-center flex flex-col items-center shadow-lg relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

            {/* Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-xs">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>DIGITAL CONTACTLESS MENU</span>
            </div>

            {/* Restaurant Info */}
            <h2 className="mt-4 text-xl font-black text-slate-900 leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-amber-800 font-semibold mt-1">
              {business.category} • {business.city}
            </p>
            {business.description && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 px-2">
                {business.description}
              </p>
            )}

            <div className="my-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
              <span className="w-8 h-px bg-slate-300"></span>
              <span>मेनू कार्ड पाहण्यासाठी स्कॅन करा</span>
              <span className="w-8 h-px bg-slate-300"></span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-amber-200">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`Menu QR for ${business.name}`}
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 bg-white/90 rounded-xl p-2.5 w-full border border-amber-200 shadow-xs">
              <p className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1">
                <span>📱 Scan with any Camera or Google Lens</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Browse our complete food & beverage menu on your mobile!
              </p>
            </div>

            {/* Phone */}
            {business.phone && (
              <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-slate-700">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>Orders & Assistance: {business.phone}</span>
              </div>
            )}

            <p className="mt-2 text-[10px] text-slate-400 break-all max-w-full px-2">
              {menuUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
