import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Smartphone,
  Star,
  ShieldCheck,
  UtensilsCrossed,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  QrCode,
  Globe,
  Share2,
  Building,
  TrendingUp,
  MessageSquare,
  Lock,
  Download,
  Users,
} from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { syncCurrentUserToDb } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PublicHomePage() {
  const authSync = await syncCurrentUserToDb();
  const isAdmin = authSync.user?.role === 'ADMIN' || authSync.user?.role === 'SUPERADMIN';
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>ADVIKS Softech — Smart NFC &amp; QR Standees with Multi-Lingual AI Review Automation</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>ADVIKS Softech</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Review Hub
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">
                NFC Tap • QR Code • Digital Menu
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#digital-menu" className="hover:text-white transition">Digital Menu</a>
            <a href="#contact" className="hover:text-white transition">Contact Us</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAdmin ? 'Admin Portal' : 'My Account (User)'}</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <Link
                href="/sign-in"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Feature Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-blue-400 text-xs font-bold shadow-xs">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Contactless 1-Tap NFC &amp; Smart QR Technology</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Convert Walk-In Customers Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                5-Star Google Reviews
              </span>{' '}
              Instantly
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
              Equip your restaurant, cafe, clinic, hotel, or retail shop with smart NFC tap acrylic
              standees. Customers pick 1-tap AI-generated positive reviews in{' '}
              <strong className="text-white">Marathi (मराठी)</strong>,{' '}
              <strong className="text-white">Hindi (हिंदी)</strong>, and{' '}
              <strong className="text-white">English</strong> — while negative feedback is safely
              intercepted before reaching Google!
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Get Your Smart Standee Today</span>
              </a>

              <Link
                href="/sign-in"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-sm border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Login</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero App Download Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Lingual AI Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Negative Review Protection</span>
              </div>
            </div>
          </div>

          {/* Interactive Mockup / Standee Showcase */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 shadow-2xl relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Standee Graphic Preview */}
              <div className="bg-gradient-to-b from-blue-50 to-white text-slate-900 rounded-3xl p-6 shadow-xl border-2 border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500" />
                <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                  <span>Google Verified Reviews</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Sample Restaurant &amp; Cafe
                </h3>
                <p className="text-xs text-slate-500">Fine Dining • Pune</p>
                <div className="flex justify-center gap-1 my-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="w-full text-white rounded-xl py-2 px-3 my-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <span className="font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5">
                    ⚡ TAP PHONE HERE (NFC)
                  </span>
                  <p className="text-[10px] text-blue-100 mt-0.5">or scan the QR code below</p>
                </div>

                <div className="w-32 h-32 bg-white rounded-2xl border-2 border-blue-200 p-2 mx-auto flex items-center justify-center shadow-xs">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>

                <p className="mt-3 text-[11px] font-bold text-slate-800">
                  स्मार्टफोन टॅप करा किंवा QR स्कॅन करा
                </p>
              </div>

              {/* Feature Highlights on the side */}
              <div className="space-y-4">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>NFC Instant Tap</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Customers touch their smartphone to the standee and the review portal opens in less than a second.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Gemini AI 1-Tap Copy Reviews</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No typing required. Customers select pre-generated 5-star reviews in Marathi, Hindi, or English and paste into Google in 5 seconds.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>Smart Rating Interceptor</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Customers selecting 1-3 stars are shown a polite thank-you message with feedback routed privately to management, preserving your Google Maps star rating.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Powerful Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-4">
              Everything Your Business Needs for 5-Star Dominance
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed specifically for restaurants, dining cafes, clinics, hospitals, hotels, salons, and retail shops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">⚡ 1-Tap NFC Contactless Tap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                NFC chip embedded directly into printed acrylic tent cards. Customers just tap their phone to open the review flow.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">🗣️ Multi-Lingual AI Reviews</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate authentic reviews in Marathi, Hindi, and English with variations in enthusiastic, concise, and detailed tones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">🛡️ Negative Review Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure your minimum rating threshold. 1-star, 2-star, and 3-star ratings remain confidential to protect your public rating.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">🍽️ Digital QR &amp; NFC Menus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Host your full restaurant food menu with pinch-to-zoom images, full-screen lightbox, and instant update capability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">🖨️ High-Res PDF &amp; PNG Standees</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download print-ready tent card designs with inbuilt NFC wave logos and high-contrast QR codes ready for printing.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">📈 Top 3 Google Maps Ranking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                More 5-star reviews on Google Maps place your business in the prestigious Google Local 3-Pack, driving daily walk-in traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-4">
              How Smart NFC Standees Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Step 1 */}
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Setup Your Business Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add your business name, Google Place ID, and custom keywords in under 60 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">Place Standee on Counter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download your standee PDF or receive an acrylic NFC standee to place on dining tables or the billing reception.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">Customers Tap &amp; Post</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customers tap their phone, pick a 5-star AI review in Marathi, Hindi, or English, and post to Google in 5 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Menu Highlight Section */}
      <section id="digital-menu" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 rounded-3xl p-8 sm:p-12 border border-amber-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Restaurant Contactless Menus
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 leading-tight">
                  Modern Touch-Free Dining Menus on Every Table
                </h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Eliminate expensive printed paper menus that get dirty and worn out. Upload high-resolution menu images, organize by category pages, and allow diners to pinch, zoom, and explore dishes directly on their smartphones with 1-tap NFC.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-amber-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Instant Update Any Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Table Assistance Call Button</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Multi-Page High-Res Zoom</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-white text-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-amber-300 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 mb-2">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                    <span>DIGITAL CONTACTLESS MENU</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">Touchless Dining Experience</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Hold phone near standee (NFC) or scan with Camera
                  </p>
                  <div className="w-28 h-28 bg-white rounded-xl border border-amber-200 p-2 mx-auto my-3 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                    ⚡ TAP PHONE (NFC) OR SCAN QR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Details & Inquiry Section (Advik's Softech) */}
      <section id="contact" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800 via-slate-850 to-indigo-950 rounded-3xl p-8 sm:p-12 border border-slate-700/80 shadow-2xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
                Order Your Custom Smart NFC Standee
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                Contact <strong className="text-white">ADVIKS Softech</strong> directly to order acrylic standees, setup your businesses, or schedule a quick walkthrough.
              </p>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone 1 */}
              <a
                href="tel:8600570542"
                className="bg-slate-900/80 hover:bg-slate-900 p-6 rounded-2xl border border-slate-700/80 hover:border-blue-500 transition group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Call &amp; WhatsApp
                </span>
                <p className="text-base font-extrabold text-white mt-1 group-hover:text-blue-400 transition">
                  8600570542
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
                  Available Now
                </span>
              </a>

              {/* Phone 2 */}
              <a
                href="tel:7620198805"
                className="bg-slate-900/80 hover:bg-slate-900 p-6 rounded-2xl border border-slate-700/80 hover:border-indigo-500 transition group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Secondary Support
                </span>
                <p className="text-base font-extrabold text-white mt-1 group-hover:text-indigo-400 transition">
                  7620 198 805
                </p>
                <span className="text-[11px] text-blue-400 font-semibold mt-1 inline-block">
                  Direct Line
                </span>
              </a>

              {/* Email */}
              <a
                href="mailto:advikssoftech@gmail.com"
                className="bg-slate-900/80 hover:bg-slate-900 p-6 rounded-2xl border border-slate-700/80 hover:border-purple-500 transition group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Support
                </span>
                <p className="text-sm font-extrabold text-white mt-1 break-all group-hover:text-purple-400 transition">
                  advikssoftech@gmail.com
                </p>
                <span className="text-[11px] text-purple-400 font-semibold mt-1 inline-block">
                  24/7 Response
                </span>
              </a>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="mt-8 pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-base font-bold text-white">Need Custom Standee Printing or NFC Cards?</h4>
                <p className="text-xs text-slate-400">
                  Chat with our technical team directly on WhatsApp or over phone.
                </p>
              </div>

              <a
                href="https://wa.me/918600570542?text=Hello%20ADVIKS%20Softech,%20I%20am%20interested%20in%20the%20Smart%20NFC%20Review%20and%20Digital%20Menu%20Standees."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Chat on WhatsApp (8600570542)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">ADVIKS Softech</span>
            <span>•</span>
            <span>AI Review &amp; Digital Menu Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="tel:8600570542" className="hover:text-white transition">8600570542</a>
            <a href="tel:7620198805" className="hover:text-white transition">7620 198 805</a>
            <a href="mailto:advikssoftech@gmail.com" className="hover:text-white transition">advikssoftech@gmail.com</a>
          </div>

          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} ADVIKS Softech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
