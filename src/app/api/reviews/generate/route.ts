import { NextResponse } from 'next/server';
import { getBusinessByIdOrSlug } from '@/lib/storage';
import { generateReviewsWithGemini } from '@/lib/gemini';
import { SupportedLanguage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, rating, language, aspects } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const business = await getBusinessByIdOrSlug(businessId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const validRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const validLang: SupportedLanguage = ['en', 'hi', 'mr'].includes(language)
      ? language
      : 'en';

    const options = await generateReviewsWithGemini({
      business,
      rating: validRating,
      language: validLang,
      aspects: Array.isArray(aspects) ? aspects : [],
    });

    return NextResponse.json({
      success: true,
      data: {
        options,
        businessName: business.name,
        placeId: business.placeId,
        googleReviewUrl: business.googleReviewUrl,
        rating: validRating,
        language: validLang,
      },
    });
  } catch (error) {
    console.error('Error in review generation API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate reviews' },
      { status: 500 }
    );
  }
}
