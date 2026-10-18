'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import { MenuBusiness, MenuImage } from '@/lib/types';

export default function CustomerMenuPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<MenuBusiness | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active filter / tab
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [shareToast, setShareToast] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menus/${encodeURIComponent(slug)}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) {
          setBusiness(json.data);
        } else {
          setError(json.error || 'Menu not found');
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
        setError('Network error while loading digital menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business?.name} - Digital Menu`,
          text: `Check out the food menu for ${business?.name}!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const nextLightbox = () => {
    if (!business?.menuImages) return;
    setLightboxIndex((prev) => (prev + 1) % business.menuImages.length);
    setZoomLevel(1);
  };

  const prevLightbox = () => {
    if (!business?.menuImages) return;
    setLightboxIndex((prev) => (prev - 1 + business.menuImages.length) % business.menuImages.length);
    setZoomLevel(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-amber-50/40">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-700 font-semibold text-sm">Opening digital menu...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Menu Card Not Found</h1>
        <p className="text-slate-500 text-sm max-w-sm mt-2">
          {error || 'This digital menu link is no longer available or has been updated.'}
        </p>
      </div>
    );
  }

  const images = business.menuImages || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-slate-50 to-slate-100 text-slate-900 pb-16">
      {/* Top Header Card */}
      <header className="bg-white border-b border-amber-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                {business.name}
              </h1>
              <p className="text-xs text-amber-800 font-semibold truncate flex items-center gap-1.5">
                <span>{business.category}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {business.city}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200"
                title="Call Restaurant"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Share Menu"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
          Menu link copied to clipboard!
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* Restaurant Description */}
        {business.description && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-100 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {business.description}
            </p>
          </div>
        )}

        {/* Page Selector Tabs */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedPageIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedPageIndex === idx
                    ? 'bg-amber-600 text-white shadow-xs shadow-amber-300'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{img.title || `Page ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        )}

        {/* Menu Cards Display */}
        {images.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-amber-200">
            <UtensilsCrossed className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Menu Being Prepared</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              The restaurant management is currently uploading the latest menu cards. Please check back shortly or ask your server!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {images.map((img, idx) => {
              // Highlight the selected page if user clicked a tab
              const isSelected = selectedPageIndex === idx;
              return (
                <div
                  key={img.id || idx}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-amber-500 border-amber-400' : 'border-slate-200'
                  }`}
                >
                  <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        Page {idx + 1} of {images.length}
                      </span>
                      <h3 className="text-sm font-black text-slate-800">
                        {img.title || `Menu Page ${idx + 1}`}
                      </h3>
                    </div>
                    <button
                      onClick={() => openLightbox(idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full View</span>
                    </button>
                  </div>

                  {/* Menu Image Preview */}
                  <div
                    onClick={() => openLightbox(idx)}
                    className="relative cursor-pointer group bg-slate-900/5 flex items-center justify-center overflow-hidden min-h-[300px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.title || `Menu page ${idx + 1}`}
                      className="w-full h-auto object-contain transition group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                        <ZoomIn className="w-4 h-4" />
                        Tap to Zoom
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none">
          {/* Top Bar */}
          <div className="p-4 flex items-center justify-between text-white bg-black/40 backdrop-blur-xs">
            <div>
              <p className="text-xs font-semibold text-amber-400">
                Page {lightboxIndex + 1} of {images.length}
              </p>
              <h4 className="text-sm font-bold truncate max-w-xs">
                {images[lightboxIndex]?.title || `Menu Page ${lightboxIndex + 1}`}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-white/70 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-lg transition ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with Zoom */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 relative">
            {images.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition shadow-lg"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextLightbox}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition shadow-lg"
                  title="Next Page"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]?.url}
              alt={images[lightboxIndex]?.title || `Menu Page ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && (
            <div className="p-3 bg-black/40 backdrop-blur-xs flex items-center justify-center gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => {
                    setLightboxIndex(i);
                    setZoomLevel(1);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                    lightboxIndex === i ? 'border-amber-400 scale-105' : 'border-white/30 opacity-60'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
