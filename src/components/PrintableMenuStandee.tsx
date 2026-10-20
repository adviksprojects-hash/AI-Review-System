'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MenuBusiness } from '@/lib/types';
import { Download, X, UtensilsCrossed, Phone, Smartphone, Loader2, Printer } from 'lucide-react';
import { NFC_TAP_LOGO_BASE64 } from '@/lib/nfcLogo';
import { generateQrWithLogo } from '@/lib/qrcode';

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
  const standeeCardRef = useRef<HTMLDivElement>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [inbuiltQr, setInbuiltQr] = useState<string>(qrDataUrl);

  // Generate seamless inbuilt QR code with logo baked directly onto the canvas pixels
  useEffect(() => {
    if (!menuUrl) return;
    let isMounted = true;
    generateQrWithLogo(menuUrl, NFC_TAP_LOGO_BASE64, { size: 450 })
      .then((url) => {
        if (isMounted && url) setInbuiltQr(url);
      })
      .catch((err) => console.error('Failed to generate inbuilt menu QR:', err));
    return () => {
      isMounted = false;
    };
  }, [menuUrl]);

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
      link.download = `menu-standee-${business.slug}.png`;
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
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Smart Contactless Menu Standee</h3>
            <p className="text-xs text-slate-500">
              Print directly or download high-resolution PNG image.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={downloadingImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs cursor-pointer"
              title="Print menu standee"
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
              background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 45%, #fff7ed 100%)',
              border: '2px solid #fcd34d',
            }}
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

            {/* Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>DIGITAL CONTACTLESS MENU</span>
            </div>

            {/* Business Info */}
            <h2 className="mt-3 text-xl font-black text-slate-900 leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {business.category} {business.city ? `• ${business.city}` : ''}
            </p>

            {/* Prominent NFC & QR Dual Badge */}
            <div
              className="w-full text-white rounded-xl p-2.5 my-3"
              style={{ background: 'linear-gradient(90deg, #d97706 0%, #ea580c 100%)' }}
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
              <p className="text-[10px] text-amber-100 font-medium mt-0.5">
                or scan the QR code to open the menu
              </p>
            </div>

            {/* QR Code Container with Inbuilt / Center NFC Logo */}
            <div className="p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-sm flex items-center justify-center">
              {inbuiltQr || qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={inbuiltQr || qrDataUrl}
                  alt={`Menu QR for ${business.name}`}
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
              className="mt-3.5 bg-white rounded-xl p-2.5 w-full text-center"
              style={{ border: '1px solid #fde68a' }}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>स्मार्टफोन टॅप करा किंवा कॅमेऱ्याने QR स्कॅन करा</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                Hold phone near standee (NFC) or scan with Camera / Google Lens
              </p>
            </div>

            {/* Phone for Assistance */}
            {business.phone && (
              <div
                className="mt-2.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg w-full"
                style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}
              >
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Orders &amp; Table Assistance: {business.phone}</span>
              </div>
            )}

            <p className="mt-2 text-[10px] text-slate-400 break-all max-w-full px-2 text-center">
              {menuUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
