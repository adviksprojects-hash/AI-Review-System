import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { Business, CreateBusinessInput, UpdateBusinessInput } from './types';
import { nanoid } from 'nanoid';

// Lazy Global Prisma instance for Neon DB
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'businesses.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seedData: Business[] = [
      {
        id: 'biz_sample_1',
        slug: 'shree-krishna-grand-pune',
        name: 'Shree Krishna Grand Hotel & Pure Veg Restaurant',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Example Google Place ID
        category: 'Restaurant & Dining',
        city: 'Pune',
        keywords: [
          'delicious food',
          'authentic taste',
          'fast service',
          'clean ambiance',
          'family friendly',
          'hygienic kitchen',
        ],
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        customPrompt: 'Focus on authentic Maharashtrian dishes, polite staff, and family dining comfort.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'biz_sample_2',
        slug: 'dr-patil-dental-care-mumbai',
        name: 'Dr. Patil Multi-Speciality Dental Clinic',
        placeId: 'ChIJd_6q_UDeuEmsRUsoyG83frY1',
        category: 'Dental Clinic & Healthcare',
        city: 'Mumbai',
        keywords: [
          'painless treatment',
          'modern clinic',
          'caring doctor',
          'affordable pricing',
          'clean and sanitized',
        ],
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJd_6q_UDeuEmsRUsoyG83frY1',
        customPrompt: 'Highlight gentle and painless procedures, high sterilization standards, and clear consultation.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

function readLocalData(): Business[] {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local businesses file:', err);
    return [];
  }
}

function writeLocalData(businesses: Business[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(businesses, null, 2), 'utf-8');
}

export function generateGoogleReviewUrl(placeId: string): string {
  const cleanId = placeId.trim();
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanId)}`;
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 40);
  const suffix = nanoid(5).toLowerCase();
  return `${base || 'business'}-${suffix}`;
}

const isNeonDbConfigured = () => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
};

export async function getAllBusinesses(): Promise<Business[]> {
  if (isNeonDbConfigured()) {
    try {
      const records = await getPrisma().business.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        placeId: r.placeId,
        category: r.category,
        city: r.city,
        keywords: r.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        googleReviewUrl: r.googleReviewUrl || generateGoogleReviewUrl(r.placeId),
        customPrompt: r.customPrompt || undefined,
        geminiApiKey: r.geminiApiKey || undefined,
        minRatingForRedirect: r.minRatingForRedirect ?? 4,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.warn('Postgres connection failed, falling back to local file store:', error);
      return readLocalData();
    }
  }

  return readLocalData();
}

export async function getBusinessByIdOrSlug(identifier: string): Promise<Business | null> {
  if (!identifier) return null;

  if (isNeonDbConfigured()) {
    try {
      const r = await getPrisma().business.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });
      if (r) {
        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          placeId: r.placeId,
          category: r.category,
          city: r.city,
          keywords: r.keywords.split(',').map((k) => k.trim()).filter(Boolean),
          googleReviewUrl: r.googleReviewUrl || generateGoogleReviewUrl(r.placeId),
          customPrompt: r.customPrompt || undefined,
          geminiApiKey: r.geminiApiKey || undefined,
          minRatingForRedirect: r.minRatingForRedirect ?? 4,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
    } catch (error) {
      console.warn('Neon DB query error, using local storage fallback:', error);
    }
  }

  const list = readLocalData();
  const found = list.find((b) => b.id === identifier || b.slug === identifier);
  return found || null;
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const keywordsArray = Array.isArray(input.keywords)
    ? input.keywords.map((k) => k.trim()).filter(Boolean)
    : input.keywords.split(',').map((k) => k.trim()).filter(Boolean);

  const slug = input.customSlug?.trim() || generateSlug(input.name);
  const googleReviewUrl = generateGoogleReviewUrl(input.placeId);

  if (isNeonDbConfigured()) {
    try {
      const created = await getPrisma().business.create({
        data: {
          slug,
          name: input.name.trim(),
          placeId: input.placeId.trim(),
          category: input.category.trim(),
          city: input.city.trim(),
          keywords: keywordsArray.join(', '),
          googleReviewUrl,
          customPrompt: input.customPrompt?.trim() || null,
          geminiApiKey: input.geminiApiKey?.trim() || null,
          minRatingForRedirect: input.minRatingForRedirect !== undefined ? Number(input.minRatingForRedirect) : 4,
          isActive: true,
        },
      });

      return {
        id: created.id,
        slug: created.slug,
        name: created.name,
        placeId: created.placeId,
        category: created.category,
        city: created.city,
        keywords: keywordsArray,
        googleReviewUrl: created.googleReviewUrl || googleReviewUrl,
        customPrompt: created.customPrompt || undefined,
        geminiApiKey: created.geminiApiKey || undefined,
        minRatingForRedirect: created.minRatingForRedirect ?? 4,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Postgres insertion error, writing to local file store instead:', error);
    }
  }

  const list = readLocalData();
  const newBusiness: Business = {
    id: `biz_${nanoid(10)}`,
    slug,
    name: input.name.trim(),
    placeId: input.placeId.trim(),
    category: input.category.trim(),
    city: input.city.trim(),
    keywords: keywordsArray,
    googleReviewUrl,
    customPrompt: input.customPrompt?.trim() || undefined,
    geminiApiKey: input.geminiApiKey?.trim() || undefined,
    minRatingForRedirect: input.minRatingForRedirect !== undefined ? Number(input.minRatingForRedirect) : 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  list.unshift(newBusiness);
  writeLocalData(list);
  return newBusiness;
}

export async function updateBusiness(
  id: string,
  input: UpdateBusinessInput
): Promise<Business | null> {
  const keywordsArray = input.keywords !== undefined
    ? (Array.isArray(input.keywords)
        ? input.keywords.map((k) => k.trim()).filter(Boolean)
        : input.keywords.split(',').map((k) => k.trim()).filter(Boolean))
    : undefined;

  const googleReviewUrl = input.placeId ? generateGoogleReviewUrl(input.placeId) : undefined;

  if (isNeonDbConfigured()) {
    try {
      const updated = await getPrisma().business.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.placeId !== undefined ? { placeId: input.placeId.trim(), googleReviewUrl } : {}),
          ...(input.category !== undefined ? { category: input.category.trim() } : {}),
          ...(input.city !== undefined ? { city: input.city.trim() } : {}),
          ...(keywordsArray !== undefined ? { keywords: keywordsArray.join(', ') } : {}),
          ...(input.customPrompt !== undefined ? { customPrompt: input.customPrompt.trim() } : {}),
          ...(input.geminiApiKey !== undefined ? { geminiApiKey: input.geminiApiKey.trim() || null } : {}),
          ...(input.minRatingForRedirect !== undefined ? { minRatingForRedirect: Number(input.minRatingForRedirect) } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });

      return {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        placeId: updated.placeId,
        category: updated.category,
        city: updated.city,
        keywords: updated.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        googleReviewUrl: updated.googleReviewUrl || generateGoogleReviewUrl(updated.placeId),
        customPrompt: updated.customPrompt || undefined,
        geminiApiKey: updated.geminiApiKey || undefined,
        minRatingForRedirect: updated.minRatingForRedirect ?? 4,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Neon DB update error, falling back to local file store:', error);
    }
  }

  const list = readLocalData();
  const index = list.findIndex((b) => b.id === id || b.slug === id);
  if (index === -1) return null;

  const existing = list[index];
  const updated: Business = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    placeId: input.placeId !== undefined ? input.placeId.trim() : existing.placeId,
    category: input.category !== undefined ? input.category.trim() : existing.category,
    city: input.city !== undefined ? input.city.trim() : existing.city,
    keywords: keywordsArray !== undefined ? keywordsArray : existing.keywords,
    googleReviewUrl: input.placeId !== undefined ? generateGoogleReviewUrl(input.placeId) : existing.googleReviewUrl,
    customPrompt: input.customPrompt !== undefined ? input.customPrompt.trim() : existing.customPrompt,
    geminiApiKey: input.geminiApiKey !== undefined ? (input.geminiApiKey.trim() || undefined) : existing.geminiApiKey,
    minRatingForRedirect: input.minRatingForRedirect !== undefined ? Number(input.minRatingForRedirect) : existing.minRatingForRedirect,
    isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  writeLocalData(list);
  return updated;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  if (isNeonDbConfigured()) {
    try {
      await getPrisma().business.delete({ where: { id } });
      return true;
    } catch (error) {
      console.warn('Neon DB delete error, falling back to local file store:', error);
    }
  }

  const list = readLocalData();
  const filtered = list.filter((b) => b.id !== id && b.slug !== id);
  if (filtered.length === list.length) return false;
  writeLocalData(filtered);
  return true;
}
