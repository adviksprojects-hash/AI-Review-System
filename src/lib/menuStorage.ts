import fs from 'fs';
import path from 'path';
import { getPrisma } from './storage';
import { MenuBusiness, CreateMenuBusinessInput, UpdateMenuBusinessInput, MenuImage } from './types';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data');
const MENUS_FILE = path.join(DATA_DIR, 'menus.json');

function ensureMenusFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MENUS_FILE)) {
    const seedData: MenuBusiness[] = [
      {
        id: 'menu_sample_1',
        slug: 'royal-heritage-restaurant-pune',
        name: 'Royal Heritage Multi-Cuisine Restaurant & Bar',
        category: 'Family Restaurant & Bar',
        city: 'Pune',
        description: 'Authentic Maharashtrian, Tandoor, Chinese, and Continental delicacies.',
        phone: '+91 98220 12345',
        menuImages: [
          {
            id: 'img_1',
            title: 'Soups & Starters (Veg / Non-Veg)',
            url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
          },
          {
            id: 'img_2',
            title: 'Main Course & Tandoori Breads',
            url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop&q=80',
          },
          {
            id: 'img_3',
            title: 'Beverages, Mocktails & Desserts',
            url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop&q=80',
          },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(MENUS_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

function readLocalMenus(): MenuBusiness[] {
  ensureMenusFile();
  try {
    const content = fs.readFileSync(MENUS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local menus file:', err);
    return [];
  }
}

function writeLocalMenus(menus: MenuBusiness[]) {
  ensureMenusFile();
  try {
    fs.writeFileSync(MENUS_FILE, JSON.stringify(menus, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to local menus file (e.g. read-only serverless):', err);
  }
}

export function generateMenuSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 40);
  const suffix = nanoid(5).toLowerCase();
  return `${base || 'menu'}-${suffix}`;
}

const isNeonDbConfigured = () => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
};

function parseImages(jsonStringOrArray: string | MenuImage[]): MenuImage[] {
  if (Array.isArray(jsonStringOrArray)) return jsonStringOrArray;
  try {
    const parsed = JSON.parse(jsonStringOrArray);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getAllMenuBusinesses(): Promise<MenuBusiness[]> {
  if (isNeonDbConfigured()) {
    try {
      const records = await getPrisma().menuBusiness.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        category: r.category,
        city: r.city,
        description: r.description || undefined,
        phone: r.phone || undefined,
        menuImages: parseImages(r.menuImages),
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.warn('Postgres connection failed for menus, falling back to local file store:', error);
      return readLocalMenus();
    }
  }

  return readLocalMenus();
}

export async function getMenuBusinessByIdOrSlug(identifier: string): Promise<MenuBusiness | null> {
  if (!identifier) return null;

  if (isNeonDbConfigured()) {
    try {
      const r = await getPrisma().menuBusiness.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });
      if (r) {
        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          category: r.category,
          city: r.city,
          description: r.description || undefined,
          phone: r.phone || undefined,
          menuImages: parseImages(r.menuImages),
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
    } catch (error) {
      console.warn('Neon DB query error for menu, using local storage fallback:', error);
    }
  }

  const list = readLocalMenus();
  const found = list.find((b) => b.id === identifier || b.slug === identifier);
  return found || null;
}

export async function createMenuBusiness(input: CreateMenuBusinessInput): Promise<MenuBusiness> {
  const slug = input.customSlug?.trim() || generateMenuSlug(input.name);
  const images = input.menuImages || [];

  if (isNeonDbConfigured()) {
    try {
      const created = await getPrisma().menuBusiness.create({
        data: {
          slug,
          name: input.name.trim(),
          category: input.category.trim(),
          city: input.city.trim(),
          description: input.description?.trim() || null,
          phone: input.phone?.trim() || null,
          menuImages: JSON.stringify(images),
          isActive: true,
        },
      });

      return {
        id: created.id,
        slug: created.slug,
        name: created.name,
        category: created.category,
        city: created.city,
        description: created.description || undefined,
        phone: created.phone || undefined,
        menuImages: images,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Postgres insertion error for menu, writing to local file store instead:', error);
    }
  }

  const list = readLocalMenus();
  const newMenuBiz: MenuBusiness = {
    id: `menu_${nanoid(10)}`,
    slug,
    name: input.name.trim(),
    category: input.category.trim(),
    city: input.city.trim(),
    description: input.description?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    menuImages: images,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  list.unshift(newMenuBiz);
  writeLocalMenus(list);
  return newMenuBiz;
}

export async function updateMenuBusiness(
  id: string,
  input: UpdateMenuBusinessInput
): Promise<MenuBusiness | null> {
  const imagesJson = input.menuImages ? JSON.stringify(input.menuImages) : undefined;

  if (isNeonDbConfigured()) {
    try {
      const updated = await getPrisma().menuBusiness.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.category !== undefined ? { category: input.category.trim() } : {}),
          ...(input.city !== undefined ? { city: input.city.trim() } : {}),
          ...(input.description !== undefined ? { description: input.description.trim() } : {}),
          ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
          ...(imagesJson !== undefined ? { menuImages: imagesJson } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });

      return {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        category: updated.category,
        city: updated.city,
        description: updated.description || undefined,
        phone: updated.phone || undefined,
        menuImages: parseImages(updated.menuImages),
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Neon DB menu update error, falling back to local file store:', error);
    }
  }

  const list = readLocalMenus();
  const index = list.findIndex((b) => b.id === id || b.slug === id);
  if (index === -1) return null;

  const existing = list[index];
  const updated: MenuBusiness = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    category: input.category !== undefined ? input.category.trim() : existing.category,
    city: input.city !== undefined ? input.city.trim() : existing.city,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    phone: input.phone !== undefined ? input.phone.trim() : existing.phone,
    menuImages: input.menuImages !== undefined ? input.menuImages : existing.menuImages,
    isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  writeLocalMenus(list);
  return updated;
}

export async function deleteMenuBusiness(id: string): Promise<boolean> {
  if (isNeonDbConfigured()) {
    try {
      await getPrisma().menuBusiness.delete({ where: { id } });
      return true;
    } catch (error) {
      console.warn('Neon DB menu delete error, falling back to local file store:', error);
    }
  }

  const list = readLocalMenus();
  const filtered = list.filter((b) => b.id !== id && b.slug !== id);
  if (filtered.length === list.length) return false;
  writeLocalMenus(filtered);
  return true;
}
