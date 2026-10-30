'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  Sparkles,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { ContactBusiness } from '@/lib/types';
import {
  formatWhatsAppUrl,
  formatInstagramUrl,
  formatFacebookUrl,
  formatYouTubeUrl,
} from '@/lib/contactUtils';

interface CustomerContactClientProps {
  slug: string;
  initialBusiness: ContactBusiness | null;
}

export default function CustomerContactClient({
  slug,
  initialBusiness,
}: CustomerContactClientProps) {
  const [business] = useState<ContactBusiness | null>(initialBusiness);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Business Contact Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The contact QR page you are looking for doesn't exist or is currently inactive.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition"
          >
            Visit Homepage
          </a>
        </div>
      </div>
    );
  }

  const whatsappUrl = formatWhatsAppUrl(business.whatsappNo, business.name);
  const instagramUrl = formatInstagramUrl(business.instagramId);
  const facebookUrl = formatFacebookUrl(business.facebookId);
  const youtubeUrl = formatYouTubeUrl(business.youtubeId);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connect with ${business.name}`,
          text: `Contact details and social links for ${business.name} in ${business.city}`,
          url,
        });
      } catch {
        // Ignored if user dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    }
  };

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: business.instagramId ? (business.instagramId.startsWith('@') ? business.instagramId : `@${business.instagramId}`) : 'Follow Us',
      url: instagramUrl,
      actionText: 'Follow on Instagram',
      colorClass: 'from-fuchsia-600 via-rose-500 to-amber-400',
      borderHover: 'hover:border-pink-500 hover:shadow-pink-500/10',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
      iconRender: (
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-md relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95 shrink-0"
          style={{
            background:
              'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          }}
        >
          <svg
            className="w-9 h-9 sm:w-11 sm:h-11 text-white"
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
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: business.youtubeId ? (business.youtubeId.startsWith('@') ? business.youtubeId : `@${business.youtubeId}`) : 'Watch Channel',
      url: youtubeUrl,
      actionText: 'Subscribe on YouTube',
      colorClass: 'from-red-600 to-red-500',
      borderHover: 'hover:border-red-500 hover:shadow-red-500/10',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      iconRender: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FF0000] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 shrink-0">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: business.facebookId ? business.facebookId : 'Official Page',
      url: facebookUrl,
      actionText: 'Connect on Facebook',
      colorClass: 'from-blue-600 to-blue-500',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-500/10',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconRender: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1877F2] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 shrink-0">
          <svg className="w-9 h-9 sm:w-11 sm:h-11 text-white fill-white" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: business.whatsappNo ? business.whatsappNo : 'Direct Chat',
      url: whatsappUrl,
      actionText: 'Chat on WhatsApp',
      colorClass: 'from-emerald-500 to-green-600',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconRender: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#25D366] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 shrink-0">
          <svg className="w-9 h-9 sm:w-11 sm:h-11 text-white fill-white" viewBox="0 0 24 24">
            <path d="M12.031 0C5.396 0 .011 5.385.011 12.02c0 2.119.553 4.185 1.603 6.007L.004 24l6.155-1.614c1.765.962 3.754 1.47 5.867 1.47 6.634 0 12.019-5.386 12.019-12.02S18.665 0 12.031 0zm0 21.99c-1.793 0-3.552-.482-5.09-1.393l-.365-.216-3.779.991 1.008-3.684-.237-.377A9.972 9.972 0 0 1 2.03 12.02c0-5.514 4.486-10 10.001-10 5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10zm5.485-7.5c-.301-.15-1.782-.88-2.058-.98-.276-.1-.476-.15-.677.15-.201.301-.778.98-.954 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.422-1.495-.896-.799-1.501-1.785-1.677-2.086-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.234-.244-.587-.492-.507-.677-.517l-.577-.01c-.201 0-.527.075-.803.376-.276.301-1.053 1.029-1.053 2.509s1.079 2.91 1.229 3.111c.15.201 2.123 3.242 5.144 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.58-.087 1.782-.728 2.033-1.43.251-.703.251-1.305.175-1.43-.075-.125-.276-.201-.577-.351z" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-900 pb-20">
      {/* Top Banner / Verification */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
              Official Contact Hub
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Business</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-rose-500 via-blue-500 to-emerald-500" />

          {/* Business Initials Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-3">
            {business.name.slice(0, 1).toUpperCase()}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {business.name}
          </h1>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{business.city}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-3 font-medium">
            Tap any of our official platforms below to connect, chat, and follow us directly!
          </p>

          {/* Quick 4 Icons Bar Preview (Visual Bar directly matching Standee and User image) */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 sm:gap-6">
            {platforms.map((p) => {
              const active = Boolean(p.url);
              return (
                <a
                  key={p.id}
                  href={p.url || '#'}
                  target={p.url ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col items-center gap-1.5 transition-transform ${
                    active
                      ? 'cursor-pointer hover:scale-110 active:scale-95'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  title={active ? `Open ${p.name}` : `${p.name} not configured`}
                >
                  <div className="transform transition-transform">{p.iconRender}</div>
                  <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                    {p.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Detailed Individual Platform Action Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Connect on Your Preferred App</span>
            </h2>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200/60 transition"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          {platforms.map((p) => {
            const active = Boolean(p.url);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 transition-all shadow-xs ${
                  active ? `${p.borderHover} hover:shadow-md` : 'opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {p.iconRender}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 leading-none">
                          {p.name}
                        </h3>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${p.badgeBg}`}>
                          {active ? 'Official' : 'Not Linked'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-[180px] sm:max-w-xs">
                        {p.handle}
                      </p>
                    </div>
                  </div>

                  {active ? (
                    <a
                      href={p.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm hover:shadow-blue-500/20 active:scale-95 shrink-0"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Credit & Powered By ADVIKS Softech */}
        <div className="text-center pt-6 pb-2 space-y-2 border-t border-slate-200/60">
          <p className="text-xs font-bold text-slate-700">
            {business.name} • {business.city}
          </p>
          <p className="text-[11px] text-slate-400">
            Powered by{' '}
            <span className="font-bold text-blue-600">ADVIKS Softech Contact QR System</span>
          </p>
        </div>
      </div>
    </div>
  );
}
