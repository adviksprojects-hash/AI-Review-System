import React from 'react';
import { getBusinessByIdOrSlug } from '@/lib/storage';
import { generateDynamicFallback } from '@/lib/gemini';
import ReviewFlowClient from '@/components/ReviewFlowClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const business = await getBusinessByIdOrSlug(params.slug);
  if (!business) {
    return {
      title: 'Review Experience',
      description: 'Leave a 5-star Google review quickly and easily.',
    };
  }
  return {
    title: `Review ${business.name} | Verified Google Review`,
    description: `Leave your feedback for ${business.name} in ${business.city}. 1-tap positive reviews powered by AI.`,
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const business = await getBusinessByIdOrSlug(params.slug);
  const initialReviews = business
    ? generateDynamicFallback(business, 5, 'en')
    : [];

  return (
    <ReviewFlowClient
      slug={params.slug}
      initialBusiness={business}
      initialReviews={initialReviews}
    />
  );
}
