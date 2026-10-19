export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface Business {
  id: string;
  slug: string;
  name: string;
  placeId: string;
  category: string;
  city: string;
  keywords: string[];
  googleReviewUrl?: string;
  customPrompt?: string;
  geminiApiKey?: string;
  minRatingForRedirect?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessInput {
  name: string;
  placeId: string;
  category: string;
  city: string;
  keywords: string[] | string;
  customPrompt?: string;
  customSlug?: string;
  geminiApiKey?: string;
  minRatingForRedirect?: number;
}

export interface UpdateBusinessInput {
  name?: string;
  placeId?: string;
  category?: string;
  city?: string;
  keywords?: string[] | string;
  customPrompt?: string;
  geminiApiKey?: string;
  minRatingForRedirect?: number;
  isActive?: boolean;
}

export interface GenerateReviewsRequest {
  businessId: string;
  rating: number; // 1 to 5
  language: SupportedLanguage;
  aspects?: string[]; // user-chosen aspects or highlights
}

export interface ReviewOption {
  id: number;
  title: string;
  text: string;
  tone: 'Enthusiastic' | 'Detailed' | 'Concise' | 'Authentic' | 'Professional';
}

export interface GenerateReviewsResponse {
  options: ReviewOption[];
  businessName: string;
  language: SupportedLanguage;
  rating: number;
}

// Restaurant / Hotel Menu QR System Types
export interface MenuImage {
  id: string;
  title: string;
  url: string;
}

export interface MenuBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  description?: string;
  phone?: string;
  menuImages: MenuImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuBusinessInput {
  name: string;
  category: string;
  city: string;
  description?: string;
  phone?: string;
  menuImages: MenuImage[];
  customSlug?: string;
}

export interface UpdateMenuBusinessInput {
  name?: string;
  category?: string;
  city?: string;
  description?: string;
  phone?: string;
  menuImages?: MenuImage[];
  isActive?: boolean;
}

