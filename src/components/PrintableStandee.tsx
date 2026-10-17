'use client';

import React from 'react';
import { Business } from '@/lib/types';
import { Printer, X, Star } from 'lucide-react';

interface PrintableStandeeProps {
  business: Business;
  qrDataUrl: string;
  reviewUrl: string;
  onClose: () => void;
}

export default function PrintableStandee({
  business,
  qrDataUrl,
  reviewUrl,
  onClose,
}: PrintableStandeeProps) {
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
            <h3 className="text-lg font-bold text-slate-800">Printable QR Standee / Tent Card</h3>
            <p className="text-xs text-slate-500">
              Print and place on your counter, tables, or reception desk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Print Standee
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
          <div className="standee-card w-full max-w-sm border-2 border-slate-200 rounded-2xl p-6 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 text-center flex flex-col items-center shadow-lg relative overflow-hidden">
            {/* Google-like colored top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500"></div>

            {/* Google Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs border border-slate-200 text-xs font-semibold text-slate-700">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Reviews</span>
            </div>

            {/* Business Info */}
            <h2 className="mt-4 text-xl font-extrabold text-slate-900 leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {business.category} • {business.city}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 my-3 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Loved our service?
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Scan below to leave a review in 10 seconds!
            </p>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${business.name}`}
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 bg-blue-50/80 rounded-lg p-2.5 w-full border border-blue-100">
              <p className="text-[11px] font-bold text-blue-900">
                ✨ AI Review Generator Available
              </p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                Generate in English, हिंदी, or मराठी with 1-click copy!
              </p>
            </div>

            <p className="mt-3 text-[10px] text-slate-400 break-all max-w-full px-2">
              {reviewUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
