import React from 'react';
import { getMenuBusinessByIdOrSlug } from '@/lib/menuStorage';
import CustomerMenuClient from '@/components/CustomerMenuClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface CustomerMenuPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CustomerMenuPageProps): Promise<Metadata> {
  const business = await getMenuBusinessByIdOrSlug(params.slug);
  if (!business) {
    return {
      title: 'Digital Menu',
      description: 'Contactless digital restaurant food menu.',
    };
  }
  return {
    title: `${business.name} | Digital Food Menu`,
    description: `Explore the food menu, specialties, and dining delights of ${business.name} in ${business.city}.`,
  };
}

export default async function CustomerMenuPage({ params }: CustomerMenuPageProps) {
  const business = await getMenuBusinessByIdOrSlug(params.slug);
  return <CustomerMenuClient slug={params.slug} initialBusiness={business} />;
}
