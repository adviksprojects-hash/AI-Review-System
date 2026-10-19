'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Globe,
  MapPin,
  Building2,
  Share2,
  ChevronRight,
  AlertCircle,
  Send,
  HeartHandshake,
  ShieldCheck,
  Lock,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Business, ReviewOption, SupportedLanguage } from '@/lib/types';

export default function ReviewFlowPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review flow state
  const [rating, setRating] = useState<number>(5);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [generating, setGenerating] = useState<boolean>(false);
  const [reviewOptions, setReviewOptions] = useState<ReviewOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [customizedReview, setCustomizedReview] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);

  // Redirection threshold logic
  const minRedirectRating = business?.minRatingForRedirect ?? 4;
  const isRedirectAllowed = rating >= minRedirectRating;

  // Fetch business info
  useEffect(() => {
    if (!slug) return;
    const fetchBusiness = async () => {
      setLoadingBusiness(true);
      try {
        const res = await fetch(`/api/businesses/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setBusiness(json.data);
          // Trigger initial review generation
          generateReviews(json.data, 5, 'en');
        } else {
          setError(json.error || 'Business not found');
        }
      } catch (err) {
        console.error('Failed to load business:', err);
        setError('Network error while loading business information');
      } finally {
        setLoadingBusiness(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const generateReviews = async (
    targetBusiness: Business,
    targetRating: number,
    targetLang: SupportedLanguage,
    aspects: string[] = []
  ) => {
    setGenerating(true);
    setCopied(false);
    try {
      const dynamicSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch('/api/reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          businessId: targetBusiness.id,
          rating: targetRating,
          language: targetLang,
          aspects,
          seed: dynamicSeed,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.options) {
        setReviewOptions(json.data.options);
        if (json.data.options.length > 0) {
          setSelectedOptionId(json.data.options[0].id);
          setCustomizedReview(json.data.options[0].text);
        }
      }
    } catch (err) {
      console.error('Error generating reviews:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (business) {
      generateReviews(business, newRating, language, selectedAspects);
    }
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (business) {
      generateReviews(business, rating, newLang, selectedAspects);
    }
  };

  const handleAspectToggle = (aspect: string) => {
    const updated = selectedAspects.includes(aspect)
      ? selectedAspects.filter((a) => a !== aspect)
      : [...selectedAspects, aspect];
    setSelectedAspects(updated);
    if (business) {
      generateReviews(business, rating, language, updated);
    }
  };

  const handleSelectOption = (option: ReviewOption) => {
    setSelectedOptionId(option.id);
    setCustomizedReview(option.text);
  };

  const handleSubmitAction = async () => {
    if (!business) return;
    const reviewText = customizedReview.trim();
    if (!reviewText) return;

    // Direct copy to clipboard for customer convenience
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }

    // Check if rating meets threshold for Google redirection
    if (!isRedirectAllowed) {
      // Restricted rating -> DO NOT REDIRECT TO GOOGLE MAPS!
      // Show polite Thank You message modal directly
      setFeedbackSent(true);
      setShowThankYouModal(true);
      return;
    }

    // Allowed rating -> Proceed with Google Redirection
    try {
      // Trigger Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Construct Google Write Review URL
      const targetUrl =
        business.googleReviewUrl ||
        `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.placeId)}`;

      // Redirect after a brief moment to show success
      setTimeout(() => {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }, 700);
    } catch (err) {
      console.error('Redirection error:', err);
      // Fallback redirect even if clipboard failed
      const targetUrl =
        business.googleReviewUrl ||
        `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.placeId)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loadingBusiness) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium text-sm">Loading review system...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Business Not Found</h1>
        <p className="text-slate-500 text-sm max-w-sm mt-2">
          {error || 'The requested business review page does not exist or has been modified.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Business Header Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500"></div>

          <div className="flex items-start justify-between gap-3 mt-1">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 mb-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>Google Verified Place</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {business.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {business.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {business.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Star Rating Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              How was your experience?
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {rating} of 5 Stars
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleRatingChange(s)}
                className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                title={`${s} Stars`}
              >
                <Star
                  className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                    s <= rating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                      : 'text-slate-300 hover:text-amber-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Language Selector */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Select Language / भाषा निवडा
            </h2>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English', sub: 'English Review' },
              { code: 'hi', label: 'हिंदी', sub: 'Hindi Review' },
              { code: 'mr', label: 'मराठी', sub: 'Marathi Review' },
            ].map((item) => {
              const active = language === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => handleLanguageChange(item.code as SupportedLanguage)}
                  className={`py-2.5 px-3 rounded-xl border font-semibold text-center transition flex flex-col items-center justify-center ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      active ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Highlight Keyword Chips */}
          {business.keywords && business.keywords.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                Tap highlights to include in review (optional):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {business.keywords.map((kw, idx) => {
                  const selected = selectedAspects.includes(kw);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAspectToggle(kw)}
                      className={`text-xs px-2.5 py-1 rounded-full transition ${
                        selected
                          ? 'bg-blue-100 text-blue-700 border border-blue-300 font-medium'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Choose 1 of 5 AI Generated Reviews */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Choose 1 of 5 AI Reviews
            </h2>
            <button
              onClick={() =>
                generateReviews(business, rating, language, selectedAspects)
              }
              disabled={generating}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {generating ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                Gemini AI is crafting 5 authentic reviews in{' '}
                {language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'}...
              </p>
              <p className="text-xs text-slate-400">
                Tailoring tone, keywords, and local context
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Option {opt.id}: {opt.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {opt.tone}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      &ldquo;{opt.text}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Editable Preview */}
          {!generating && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Selected Review (You can edit or add personal details below):
              </label>
              <textarea
                value={customizedReview}
                onChange={(e) => setCustomizedReview(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 resize-y"
                placeholder="Review text will appear here..."
              />
            </div>
          )}
        </div>

        {/* Step 4: Submit Review Action Button */}
        <div className="sticky bottom-4 z-20">
          <button
            onClick={handleSubmitAction}
            disabled={generating || !customizedReview.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {copied && isRedirectAllowed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>
                  {language === 'mr'
                    ? 'रिव्ह्यू कॉपी झाला! गुगल उघडत आहे...'
                    : language === 'hi'
                    ? 'रिव्यू कॉपी हो गया! गूगल खुल रहा है...'
                    : 'Review Copied! Opening Google Reviews...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>
                  {language === 'mr'
                    ? 'रिव्ह्यू सबमिट करा'
                    : language === 'hi'
                    ? 'रिव्यू सबमिट करें'
                    : 'Submit Review'}
                </span>
                <ChevronRight className="w-5 h-5 opacity-70" />
              </>
            )}
          </button>

          {/* User helper tip */}
          <div className="mt-2 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'mr'
                ? '💡 "रिव्ह्यू सबमिट करा" वर क्लिक करताच रिव्ह्यू थेट कॉपी होईल.'
                : language === 'hi'
                ? '💡 "रिव्यू सबमिट करें" पर क्लिक करते ही रिव्यू सीधे कॉपी हो जाएगा।'
                : '💡 Clicking "Submit Review" will automatically copy your review.'}
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Message Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {language === 'mr'
                ? 'आपल्या अभिप्रायाबद्दल मनःपूर्वक धन्यवाद!'
                : language === 'hi'
                ? 'आपके बहुमूल्य रिव्यू के लिए धन्यवाद!'
                : 'Thank You for Your Review!'}
            </h3>

            {/* Star Rating Display */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold my-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span>{rating} of 5 Stars Submitted</span>
            </div>

            {/* Polite Thank You Message */}
            <div className="space-y-2.5 mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
              <p>
                {language === 'mr' ? (
                  <>
                    <strong>{business.name}</strong> ला आपला बहुमूल्य वेळ देऊन अभिप्राय दिल्याबद्दल धन्यवाद! आम्ही आपल्या अभिप्रायाचा आदर करतो आणि सदैव उत्तम सेवेसाठी कटिबद्ध आहोत.
                  </>
                ) : language === 'hi' ? (
                  <>
                    <strong>{business.name}</strong> को अपना बहुमूल्य समय और रिव्यू देने के लिए बहुत-बहुत धन्यवाद! हम आपके फीडबैक का सम्मान करते हैं और निरंतर बेहतर सेवा देने के लिए प्रयासरत हैं।
                  </>
                ) : (
                  <>
                    Thank you so much for taking the time to share your feedback with <strong>{business.name}</strong>. Your feedback has been recorded and is deeply appreciated!
                  </>
                )}
              </p>
            </div>

            {/* Customer's note quote */}
            {customizedReview && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Your Submitted Review:
                </span>
                <p className="text-xs text-slate-700 italic line-clamp-3">
                  &ldquo;{customizedReview}&rdquo;
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="mt-5">
              <button
                onClick={() => setShowThankYouModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm"
              >
                {language === 'mr' ? 'पूर्ण झाले' : language === 'hi' ? 'संपन्न' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
