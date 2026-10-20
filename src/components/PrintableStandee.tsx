'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Business } from '@/lib/types';
import { Download, X, Star, Smartphone, Sparkles, Loader2, Printer } from 'lucide-react';
import { NFC_TAP_LOGO_BASE64 } from '@/lib/nfcLogo';
import { generateQrWithLogo } from '@/lib/qrcode';

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
  const standeeCardRef = useRef<HTMLDivElement>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [inbuiltQr, setInbuiltQr] = useState<string>(qrDataUrl);

  // Generate seamless inbuilt QR code with logo baked directly onto the canvas pixels
  useEffect(() => {
    if (!reviewUrl) return;
    let isMounted = true;
    generateQrWithLogo(reviewUrl, NFC_TAP_LOGO_BASE64, { size: 450 })
      .then((url) => {
        if (isMounted && url) setInbuiltQr(url);
      })
      .catch((err) => console.error('Failed to generate inbuilt QR:', err));
    return () => {
      isMounted = false;
    };
  }, [reviewUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!standeeCardRef.current) return;
    try {
      setDownloadingImage(true);
      const html2canvas = (await import('html2canvas')).default;

      const element = standeeCardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High-resolution export
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `standee-${business.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download standee error:', err);
      alert('Failed to generate standee image. Please try again.');
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 standee-modal-backdrop">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative standee-modal-container">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Smart Standee / Tent Card</h3>
            <p className="text-xs text-slate-500">
              Print directly or download high-resolution PNG image.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={downloadingImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs cursor-pointer"
              title="Print standee / tent card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Standee</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloadingImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs cursor-pointer"
              title="Download high-resolution PNG image"
            >
              {downloadingImage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </>
              )}
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
        <div className="mt-6 flex justify-center standee-card-preview-wrapper overflow-x-auto">
          <div
            ref={standeeCardRef}
            className="standee-card rounded-3xl p-6 text-center flex flex-col items-center relative overflow-hidden"
            style={{
              width: '380px',
              background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 45%, #f8fafc 100%)',
              border: '2px solid #cbd5e1',
            }}
          >
            {/* Google-like colored top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500"></div>

            {/* Google Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Google Verified Reviews</span>
            </div>

            {/* Business Info */}
            <h2 className="mt-3 text-xl font-black text-slate-900 leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {business.category} • {business.city}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Prominent NFC & QR Dual Badge */}
            <div
              className="w-full text-white rounded-xl p-2.5 mb-3"
              style={{ background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 4a12 12 0 0 1 0 16" />
                  <path d="M12.5 7a7.5 7.5 0 0 1 0 10" />
                  <path d="M9 10a3 3 0 0 1 0 4" />
                </svg>
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  ⚡ TAP PHONE HERE (NFC)
                </span>
              </div>
              <p className="text-[10px] text-blue-100 font-medium mt-0.5">
                or scan the QR code below
              </p>
            </div>

            {/* QR Code Container with Inbuilt / Center NFC Logo */}
            <div className="p-3 bg-white rounded-2xl border-2 border-blue-200 shadow-sm flex items-center justify-center">
              {inbuiltQr || qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={inbuiltQr || qrDataUrl}
                  alt={`QR code for ${business.name}`}
                  className="w-48 h-48 object-contain"
                  width={192}
                  height={192}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Tap or Scan Instructions */}
            <div
              className="mt-3.5 rounded-xl p-2.5 w-full text-center"
              style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>स्मार्टफोन टॅप करा किंवा QR स्कॅन करा</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                Hold smartphone near standee (NFC) or scan with Camera
              </p>
            </div>

            {/* AI Assistant Notice */}
            <div
              className="mt-2.5 rounded-xl p-2.5 w-full text-center"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <p className="text-[11px] font-bold text-blue-900 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                <span>AI Review Assistant Available</span>
              </p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                Pick 5-star AI reviews in Marathi, Hindi &amp; English with 1-tap copy
              </p>
            </div>

            <p className="mt-2.5 text-[10px] text-slate-400 break-all max-w-full px-2 text-center">
              {reviewUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
