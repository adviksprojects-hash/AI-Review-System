import { currentUser } from '@clerk/nextjs/server';
import { getPrisma } from './storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Automatically syncs the currently logged-in Clerk user with Neon PostgreSQL DB.
 * - Every new email logging in for the first time is ALWAYS created as 'USER' by default.
 * - Changing roles between 'USER' and 'ADMIN' is controlled STRICTLY FROM THE DATABASE ONLY.
 * - If user already exists in DB, their DB role is preserved intact.
 */
export async function syncCurrentUserToDb(): Promise<{
  isAuthenticated: boolean;
  user: UserProfile | null;
  error?: string;
}> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Not authenticated with Clerk',
      };
    }

    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return {
        isAuthenticated: true,
        user: null,
        error: 'No email address found on user profile',
      };
    }

    const prisma = getPrisma();
    const normalizedEmail = email.toLowerCase().trim();
    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      'App User';

    // Check if user already exists in DB
    const existing = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Update name if changed in Clerk, but ALWAYS keep their database role as-is
      if (fullName && fullName !== existing.name) {
        const updated = await prisma.adminUser.update({
          where: { email: normalizedEmail },
          data: { name: fullName },
        });
        return {
          isAuthenticated: true,
          user: {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
          },
        };
      }
      return {
        isAuthenticated: true,
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: existing.role,
        },
      };
    }

    // New email logging in: ALWAYS create by default as 'USER'.
    // Admin role can only be granted directly in the database.
    const created = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        name: fullName,
        role: 'USER',
      },
    });

    return {
      isAuthenticated: true,
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
      },
    };
  } catch (err: any) {
    console.error('Error syncing user to DB:', err);
    return {
      isAuthenticated: false,
      user: null,
      error: err?.message || 'Database error during user synchronization',
    };
  }
}

/**
 * Verifies if the currently logged in Clerk user has ADMIN or SUPERADMIN privileges in the DB.
 */
export async function verifyAdminStatus(): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminProfile: UserProfile | null;
  error?: string;
}> {
  const sync = await syncCurrentUserToDb();
  if (!sync.isAuthenticated || !sync.user) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminProfile: null,
      error: sync.error || 'Not authenticated with Clerk',
    };
  }

  const { user } = sync;
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';

  return {
    isAuthenticated: true,
    isAdmin,
    adminProfile: user,
    error: isAdmin
      ? undefined
      : `Account '${user.email}' is registered as '${user.role}' in the database. Admin role must be granted directly in the database.`,
  };
}
