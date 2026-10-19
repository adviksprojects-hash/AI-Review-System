import React, { useRef, useState, useEffect } from 'react';
import { Business } from '@/lib/types';
import { Download, X, Star, Smartphone, Sparkles, Loader2, FileText } from 'lucide-react';
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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
      pdf.save(`standee-${business.slug}.pdf`);
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
              background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 45%, #f8fafc 100%)',
              border: '2px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          >
            {/* Google-like colored top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500"></div>

            {/* Google Badge */}
            <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
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
              <span>Google Verified Reviews</span>
            </div>

            {/* Business Info */}
            <h2 className="mt-2 text-xl font-black text-slate-900 leading-snug">
              {business.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {business.category} • {business.city}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 my-1.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Prominent NFC & QR Dual Badge */}
            <div
              className="w-full text-white rounded-xl py-2 px-3 my-2"
              style={{ background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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

            {/* Inbuilt QR Code Image (Logo baked directly into image pixels - no sticker look) */}
            <div className="p-2.5 bg-white rounded-2xl border-2 border-blue-200 shadow-xs flex items-center justify-center">
              {inbuiltQr || qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={inbuiltQr || qrDataUrl}
                  alt={`QR code for ${business.name}`}
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
              className="mt-2.5 rounded-xl py-2 px-3 w-full text-center"
              style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>स्मार्टफोन टॅप करा किंवा QR स्कॅन करा</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                Hold smartphone near standee (NFC) or scan with Camera
              </p>
            </div>

            {/* AI Assistant Notice */}
            <div
              className="mt-2 rounded-xl py-2 px-3 w-full text-center"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <p className="text-[11px] font-bold text-blue-900 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>AI Review Assistant Available</span>
              </p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                Pick 5-star AI reviews in Marathi, Hindi &amp; English with 1-tap copy
              </p>
            </div>

            {/* Clean Single-Line URL with generous bottom clearance */}
            <p className="mt-2.5 text-[10px] text-slate-400 truncate max-w-[320px] px-2 block mx-auto text-center">
              {reviewUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
