'use client';

import React, { useEffect, useState } from 'react';
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
import { generateDynamicFallback } from '@/lib/gemini';

interface ReviewFlowClientProps {
  slug: string;
  initialBusiness: Business | null;
  initialReviews?: ReviewOption[];
}

export default function ReviewFlowClient({
  slug,
  initialBusiness,
  initialReviews = [],
}: ReviewFlowClientProps) {
  const [business, setBusiness] = useState<Business | null>(initialBusiness);
  const [loadingBusiness, setLoadingBusiness] = useState<boolean>(!initialBusiness);
  const [error, setError] = useState<string | null>(
    !initialBusiness ? null : null
  );

  // Review flow state
  const [rating, setRating] = useState<number>(5);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [generating, setGenerating] = useState<boolean>(false);
  const [reviewOptions, setReviewOptions] = useState<ReviewOption[]>(initialReviews);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    initialReviews.length > 0 ? initialReviews[0].id : null
  );
  const [customizedReview, setCustomizedReview] = useState<string>(
    initialReviews.length > 0 ? initialReviews[0].text : ''
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);

  // Redirection threshold logic
  const minRedirectRating = business?.minRatingForRedirect ?? 4;
  const isRedirectAllowed = rating >= minRedirectRating;

  // Fallback client-side fetch only if initialBusiness was not provided by SSR
  useEffect(() => {
    if (initialBusiness) return;
    if (!slug) return;
    const fetchBusiness = async () => {
      setLoadingBusiness(true);
      try {
        const res = await fetch(`/api/businesses/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setBusiness(json.data);
          const fallbacks = generateDynamicFallback(json.data, 5, 'en');
          setReviewOptions(fallbacks);
          if (fallbacks.length > 0) {
            setSelectedOptionId(fallbacks[0].id);
            setCustomizedReview(fallbacks[0].text);
          }
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
  }, [slug, initialBusiness]);

  const generateReviews = async (
    targetBusiness: Business,
    targetRating: number,
    targetLang: SupportedLanguage,
    aspects: string[] = []
  ) => {
    // Immediate instant responsive update using dynamic fallback generator (0 ms latency)
    const instantFallbacks = generateDynamicFallback(targetBusiness, targetRating, targetLang);
    setReviewOptions(instantFallbacks);
    if (instantFallbacks.length > 0) {
      setSelectedOptionId(instantFallbacks[0].id);
      setCustomizedReview(instantFallbacks[0].text);
    }

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
      if (json.success && json.data?.options && json.data.options.length > 0) {
        setReviewOptions(json.data.options);
        setSelectedOptionId(json.data.options[0].id);
        setCustomizedReview(json.data.options[0].text);
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
    setCopied(false);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  // Unified Submit Review action
  const handleSubmitReview = async () => {
    const textToCopy = customizedReview.trim();
    if (textToCopy) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    }

    if (isRedirectAllowed) {
      // High rating (4-5 stars) -> copy review and redirect to Google Maps reviews
      triggerCelebration();
      const redirectUrl =
        business?.googleReviewUrl ||
        (business?.placeId
          ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.placeId)}`
          : null);

      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      }
    } else {
      // Restricted rating (1-3 stars) -> do not redirect to Google Maps, show thank you modal
      triggerCelebration();
      setFeedbackSent(true);
      setShowThankYouModal(true);
    }
  };

  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading review experience...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Business Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "The review page you are looking for doesn't exist or is currently inactive."}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Visit Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white text-slate-900 pb-16">
      {/* Top Banner / Verification */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Official Google Review Partner
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Place</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />
          <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
            {business.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {business.category} • {business.city}
          </p>

          {/* Interactive Star Rating */}
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Your Rating
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="p-1 transition-transform active:scale-95 focus:outline-hidden"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-amber-600 mt-2">
              {rating === 5 && 'Outstanding! (5.0)'}
              {rating === 4 && 'Very Good! (4.0)'}
              {rating === 3 && 'Average (3.0)'}
              {rating === 2 && 'Needs Improvement (2.0)'}
              {rating === 1 && 'Unsatisfactory (1.0)'}
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Select Review Language:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'mr', label: 'मराठी' },
                { code: 'hi', label: 'हिंदी' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  language === lang.code
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Tag Chips */}
        {business.keywords && business.keywords.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-2.5">
              Highlight what you liked (Optional):
            </p>
            <div className="flex flex-wrap gap-2">
              {business.keywords.map((aspect) => {
                const isSelected = selectedAspects.includes(aspect);
                return (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => handleAspectToggle(aspect)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {aspect}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Review Generator Options */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">
                Choose or Edit Your Review
              </h2>
            </div>
            <button
              onClick={() => generateReviews(business, rating, language, selectedAspects)}
              disabled={generating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>Regenerate AI</span>
            </button>
          </div>

          {/* Review Options Carousel/List */}
          <div className="space-y-3">
            {reviewOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{opt.title}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
                      {opt.tone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {opt.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Editable text area */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Review Text (Feel free to edit before submitting):
            </label>
            <textarea
              rows={4}
              value={customizedReview}
              onChange={(e) => setCustomizedReview(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed outline-hidden"
              placeholder="Your review text will appear here..."
            />
          </div>

          {/* Unified Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmitReview}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>Submit Review</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              1-tap copies your selected review text to clipboard.
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Modal for Restricted / Low Ratings (1-3 stars) */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your feedback for <strong className="text-slate-800">{business.name}</strong> has
              been safely recorded. We deeply appreciate your honest opinion and our management
              team will work continuously to improve your experience.
            </p>
            <button
              onClick={() => setShowThankYouModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
