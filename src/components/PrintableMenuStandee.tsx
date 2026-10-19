'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MenuBusiness } from '@/lib/types';
import { Download, X, UtensilsCrossed, Phone, Smartphone, Loader2, FileText } from 'lucide-react';
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  const handleDownloadPdf = async () => {
    if (!standeeCardRef.current) return;
    try {
      setDownloadingPdf(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(standeeCardRef.current, {
        scale: 3, // High-resolution export
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 105; // mm (standard tent card width)
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`menu-standee-${business.slug}.pdf`);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!standeeCardRef.current) return;
    try {
      setDownloadingImage(true);
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(standeeCardRef.current, {
        scale: 3, // High-resolution export
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
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
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>Restaurant Smart Standee</span>
            </h3>
            <p className="text-xs text-slate-500">
              Download exact PDF or PNG ready for printing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || downloadingImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs"
              title="Download print-ready PDF file"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloadingPdf || downloadingImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs"
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
            className="standee-card rounded-3xl text-center flex flex-col items-center relative overflow-hidden"
            style={{
              width: '380px',
              minWidth: '380px',
              maxWidth: '380px',
              minHeight: '620px',
              padding: '20px 24px 34px 24px',
              background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 45%, #fff7ed 100%)',
              border: '2px solid #fcd34d',
              boxSizing: 'border-box',
            }}
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

            {/* Badge */}
            <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
              <span>DIGITAL CONTACTLESS MENU</span>
            </div>

            {/* Restaurant Info */}
            <h2 className="mt-2 text-xl font-black text-slate-900 leading-snug">
              {business.name}
            </h2>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">
              {business.category} • {business.city}
            </p>
            {business.description && (
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 px-2">
                {business.description}
              </p>
            )}

            {/* Prominent NFC & QR Dual Badge */}
            <div
              className="w-full text-white rounded-xl py-2 px-3 my-2"
              style={{ background: 'linear-gradient(90deg, #d97706 0%, #ea580c 100%)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 4a12 12 0 0 1 0 16" />
                  <path d="M12.5 7a7.5 7.5 0 0 1 0 10" />
                  <path d="M9 10a3 3 0 0 1 0 4" />
                </svg>
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  ⚡ TAP PHONE (NFC) OR SCAN QR
                </span>
              </div>
              <p className="text-[10px] text-amber-100 font-medium mt-0.5">
                Instant digital menu on your phone • Touch-free
              </p>
            </div>

            {/* Inbuilt QR Code Image (Logo baked directly into image pixels - no sticker look) */}
            <div className="p-2.5 bg-white rounded-2xl border-2 border-amber-300 shadow-xs flex items-center justify-center">
              {inbuiltQr || qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={inbuiltQr || qrDataUrl}
                  alt={`Menu QR for ${business.name}`}
                  className="w-44 h-44 object-contain block mx-auto"
                  width={176}
                  height={176}
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Tap or Scan Instructions */}
            <div
              className="mt-2.5 bg-white rounded-xl py-2 px-3 w-full text-center"
              style={{ border: '1px solid #fde68a' }}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>स्मार्टफोन टॅप करा किंवा कॅमेऱ्याने QR स्कॅन करा</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                Hold phone near standee (NFC) or scan with Camera / Google Lens
              </p>
            </div>

            {/* Phone for Assistance */}
            {business.phone && (
              <div
                className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg w-full"
                style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}
              >
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>Orders &amp; Table Assistance: {business.phone}</span>
              </div>
            )}

            {/* Clean Single-Line URL with generous bottom clearance */}
            <p className="mt-2.5 text-[10px] text-slate-400 truncate max-w-[320px] px-2 block mx-auto text-center">
              {menuUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
