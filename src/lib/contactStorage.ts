import fs from 'fs';
import path from 'path';
import { getPrisma } from './storage';
import { ContactBusiness, CreateContactBusinessInput, UpdateContactBusinessInput } from './types';
import { nanoid } from 'nanoid';
export {
  formatWhatsAppUrl,
  formatInstagramUrl,
  formatFacebookUrl,
  formatYouTubeUrl,
} from './contactUtils';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

function ensureContactsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONTACTS_FILE)) {
    const seedData: ContactBusiness[] = [
      {
        id: 'contact_sample_1',
        slug: 'adviks-softech-pune',
        name: "ADVIKS Softech & Solutions",
        city: 'Pune',
        whatsappNo: '+91 8600570542',
        instagramId: 'adviks_softech',
        facebookId: 'advikssoftech',
        youtubeId: '@advikssoftech',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

function readLocalContacts(): ContactBusiness[] {
  ensureContactsFile();
  try {
    const content = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local contacts file:', err);
    return [];
  }
}

function writeLocalContacts(contacts: ContactBusiness[]) {
  ensureContactsFile();
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to local contacts file:', err);
  }
}

export function generateContactSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 40);
  const suffix = nanoid(5).toLowerCase();
  return `${base || 'contact'}-${suffix}`;
}

const isNeonDbConfigured = () => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
};

export async function getAllContactBusinesses(): Promise<ContactBusiness[]> {
  if (isNeonDbConfigured()) {
    try {
      const records = await (getPrisma() as any).contactBusiness.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        city: r.city,
        whatsappNo: r.whatsappNo || undefined,
        instagramId: r.instagramId || undefined,
        facebookId: r.facebookId || undefined,
        youtubeId: r.youtubeId || undefined,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.warn('Postgres connection failed for contacts, falling back to local file store:', error);
      return readLocalContacts();
    }
  }

  return readLocalContacts();
}

export async function getContactBusinessByIdOrSlug(identifier: string): Promise<ContactBusiness | null> {
  if (!identifier) return null;

  if (isNeonDbConfigured()) {
    try {
      const r = await (getPrisma() as any).contactBusiness.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });
      if (r) {
        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          city: r.city,
          whatsappNo: r.whatsappNo || undefined,
          instagramId: r.instagramId || undefined,
          facebookId: r.facebookId || undefined,
          youtubeId: r.youtubeId || undefined,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
    } catch (error) {
      console.warn('Neon DB query error for contact business, using local fallback:', error);
    }
  }

  const list = readLocalContacts();
  const found = list.find((b) => b.id === identifier || b.slug === identifier);
  return found || null;
}

export async function createContactBusiness(input: CreateContactBusinessInput): Promise<ContactBusiness> {
  const slug = input.customSlug?.trim() || generateContactSlug(input.name);

  if (isNeonDbConfigured()) {
    try {
      const created = await (getPrisma() as any).contactBusiness.create({
        data: {
          slug,
          name: input.name.trim(),
          city: input.city.trim(),
          whatsappNo: input.whatsappNo?.trim() || null,
          instagramId: input.instagramId?.trim() || null,
          facebookId: input.facebookId?.trim() || null,
          youtubeId: input.youtubeId?.trim() || null,
          isActive: true,
        },
      });

      return {
        id: created.id,
        slug: created.slug,
        name: created.name,
        city: created.city,
        whatsappNo: created.whatsappNo || undefined,
        instagramId: created.instagramId || undefined,
        facebookId: created.facebookId || undefined,
        youtubeId: created.youtubeId || undefined,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Postgres insertion error for contact, writing to local file store instead:', error);
    }
  }

  const list = readLocalContacts();
  const newContactBiz: ContactBusiness = {
    id: `contact_${nanoid(10)}`,
    slug,
    name: input.name.trim(),
    city: input.city.trim(),
    whatsappNo: input.whatsappNo?.trim() || undefined,
    instagramId: input.instagramId?.trim() || undefined,
    facebookId: input.facebookId?.trim() || undefined,
    youtubeId: input.youtubeId?.trim() || undefined,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  list.unshift(newContactBiz);
  writeLocalContacts(list);
  return newContactBiz;
}

export async function updateContactBusiness(
  id: string,
  input: UpdateContactBusinessInput
): Promise<ContactBusiness | null> {
  if (isNeonDbConfigured()) {
    try {
      const updated = await (getPrisma() as any).contactBusiness.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.city !== undefined ? { city: input.city.trim() } : {}),
          ...(input.whatsappNo !== undefined ? { whatsappNo: input.whatsappNo?.trim() || null } : {}),
          ...(input.instagramId !== undefined ? { instagramId: input.instagramId?.trim() || null } : {}),
          ...(input.facebookId !== undefined ? { facebookId: input.facebookId?.trim() || null } : {}),
          ...(input.youtubeId !== undefined ? { youtubeId: input.youtubeId?.trim() || null } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });

      return {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        city: updated.city,
        whatsappNo: updated.whatsappNo || undefined,
        instagramId: updated.instagramId || undefined,
        facebookId: updated.facebookId || undefined,
        youtubeId: updated.youtubeId || undefined,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (error) {
      console.warn('Neon DB contact update error, falling back to local file store:', error);
    }
  }

  const list = readLocalContacts();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  const updated: ContactBusiness = {
    ...current,
    name: input.name !== undefined ? input.name.trim() : current.name,
    city: input.city !== undefined ? input.city.trim() : current.city,
    whatsappNo: input.whatsappNo !== undefined ? input.whatsappNo.trim() : current.whatsappNo,
    instagramId: input.instagramId !== undefined ? input.instagramId.trim() : current.instagramId,
    facebookId: input.facebookId !== undefined ? input.facebookId.trim() : current.facebookId,
    youtubeId: input.youtubeId !== undefined ? input.youtubeId.trim() : current.youtubeId,
    isActive: input.isActive !== undefined ? input.isActive : current.isActive,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = updated;
  writeLocalContacts(list);
  return updated;
}

export async function deleteContactBusiness(id: string): Promise<boolean> {
  if (isNeonDbConfigured()) {
    try {
      await (getPrisma() as any).contactBusiness.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.warn('Neon DB contact deletion error, falling back to local file store:', error);
    }
  }

  const list = readLocalContacts();
  const filtered = list.filter((b) => b.id !== id);
  if (filtered.length !== list.length) {
    writeLocalContacts(filtered);
    return true;
  }
  return false;
}
