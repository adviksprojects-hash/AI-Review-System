'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ContactBusiness } from '@/lib/types';
import { Download, X, Smartphone, Loader2, Printer, MessageCircle, MapPin } from 'lucide-react';
import { NFC_TAP_LOGO_BASE64 } from '@/lib/nfcLogo';
import { generateQrWithLogo } from '@/lib/qrcode';

interface PrintableContactStandeeProps {
  business: ContactBusiness;
  qrDataUrl: string;
  contactUrl: string;
  onClose: () => void;
}

export default function PrintableContactStandee({
  business,
  qrDataUrl,
  contactUrl,
  onClose,
}: PrintableContactStandeeProps) {
  const standeeCardRef = useRef<HTMLDivElement>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [inbuiltQr, setInbuiltQr] = useState<string>(qrDataUrl);

  // Generate seamless inbuilt QR code with logo baked directly onto the canvas pixels
  useEffect(() => {
    if (!contactUrl) return;
    let isMounted = true;
    generateQrWithLogo(contactUrl, NFC_TAP_LOGO_BASE64, { size: 450 })
      .then((url) => {
        if (isMounted && url) setInbuiltQr(url);
      })
      .catch((err) => console.error('Failed to generate inbuilt contact QR:', err));
    return () => {
      isMounted = false;
    };
  }, [contactUrl]);

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

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${business.slug}-contact-standee.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating standee image:', err);
      alert('Failed to generate image. You can use Print -> Save as PDF instead.');
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 my-8">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Contact Us QR Standee</h3>
            <p className="text-xs text-slate-500">
              Print directly or download high-resolution PNG image.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={downloadingImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition text-xs cursor-pointer"
              title="Print contact standee"
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
              background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%, #f8fafc 100%)',
              border: '2px solid #86efac',
            }}
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-rose-500 via-blue-500 to-emerald-500"></div>

            {/* Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>CONNECT WITH US • CONTACT US</span>
            </div>

            {/* Business Info */}
            <h2 className="mt-3 text-xl font-black text-slate-900 leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{business.city}</span>
            </p>

            {/* Prominent NFC & QR Dual Badge */}
            <div
              className="w-full text-white rounded-xl p-2.5 my-3"
              style={{ background: 'linear-gradient(90deg, #059669 0%, #2563eb 100%)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M16 4a12 12 0 0 1 0 16" />
                  <path d="M12.5 7a7.5 7.5 0 0 1 0 10" />
                  <path d="M9 10a3 3 0 0 1 0 4" />
                </svg>
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  ⚡ TAP PHONE HERE (NFC)
                </span>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium mt-0.5">
                or scan QR to connect on WhatsApp &amp; Social Media
              </p>
            </div>

            {/* QR Code Container with Inbuilt / Center NFC Logo */}
            <div className="p-3 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center justify-center">
              {inbuiltQr || qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={inbuiltQr || qrDataUrl}
                  alt={`Contact QR for ${business.name}`}
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

            {/* The 4 Iconic Platforms Bar */}
            <div className="mt-3.5 bg-white rounded-2xl p-3 w-full border border-slate-200 shadow-xs flex items-center justify-around">
              {/* Instagram */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-700">Instagram</span>
              </div>

              {/* YouTube */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center shadow-xs">
                  <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-700">YouTube</span>
              </div>

              {/* Facebook */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-700">Facebook</span>
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M12.031 0C5.396 0 .011 5.385.011 12.02c0 2.119.553 4.185 1.603 6.007L.004 24l6.155-1.614c1.765.962 3.754 1.47 5.867 1.47 6.634 0 12.019-5.386 12.019-12.02S18.665 0 12.031 0zm0 21.99c-1.793 0-3.552-.482-5.09-1.393l-.365-.216-3.779.991 1.008-3.684-.237-.377A9.972 9.972 0 0 1 2.03 12.02c0-5.514 4.486-10 10.001-10 5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10zm5.485-7.5c-.301-.15-1.782-.88-2.058-.98-.276-.1-.476-.15-.677.15-.201.301-.778.98-.954 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.422-1.495-.896-.799-1.501-1.785-1.677-2.086-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.234-.244-.587-.492-.507-.677-.517l-.577-.01c-.201 0-.527.075-.803.376-.276.301-1.053 1.029-1.053 2.509s1.079 2.91 1.229 3.111c.15.201 2.123 3.242 5.144 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.58-.087 1.782-.728 2.033-1.43.251-.703.251-1.305.175-1.43-.075-.125-.276-.201-.577-.351z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-slate-700">WhatsApp</span>
              </div>
            </div>

            {/* Tap or Scan Instructions */}
            <div
              className="mt-3 bg-white rounded-xl p-2.5 w-full text-center"
              style={{ border: '1px solid #bbf7d0' }}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>स्मार्टफोन टॅप करा किंवा कॅमेऱ्याने QR स्कॅन करा</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                Hold phone near standee (NFC) or scan with Camera / Google Lens
              </p>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 break-all max-w-full px-2 text-center">
              {contactUrl}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .standee-card,
          .standee-card * {
            visibility: visible;
          }
          .standee-card {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
