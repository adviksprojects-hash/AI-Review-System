import React from 'react';
import { getContactBusinessByIdOrSlug } from '@/lib/contactStorage';
import CustomerContactClient from '@/components/CustomerContactClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface CustomerContactPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CustomerContactPageProps): Promise<Metadata> {
  const business = await getContactBusinessByIdOrSlug(params.slug);
  if (!business) {
    return {
      title: 'Contact Us | Official Business Contact',
      description: 'Connect with us on WhatsApp, Instagram, Facebook, and YouTube.',
    };
  }
  return {
    title: `Contact ${business.name} | Official Social & WhatsApp`,
    description: `Connect directly with ${business.name} in ${business.city} on WhatsApp, Instagram, Facebook, and YouTube.`,
  };
}

export default async function CustomerContactPage({ params }: CustomerContactPageProps) {
  const business = await getContactBusinessByIdOrSlug(params.slug);
  return <CustomerContactClient slug={params.slug} initialBusiness={business} />;
}
