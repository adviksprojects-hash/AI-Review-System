import { currentUser } from '@clerk/nextjs/server';
import { getPrisma } from './storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isFirstAdmin?: boolean;
}

/**
 * Automatically syncs the currently logged-in Clerk user with Neon PostgreSQL DB.
 * - If user does not exist in DB:
 *     - If DB has 0 admins, they are created with role "ADMIN".
 *     - If DB already has admins, they are automatically created with role "USER".
 * - If user exists in DB, keeps their current role and updates name if modified.
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

    // Check if user already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Update name if changed
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

    // New user signing in: check total admin count in DB
    const totalCount = await prisma.adminUser.count();
    const assignedRole = totalCount === 0 ? 'ADMIN' : 'USER';

    const created = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        name: fullName,
        role: assignedRole,
      },
    });

    return {
      isAuthenticated: true,
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        isFirstAdmin: assignedRole === 'ADMIN',
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
 * Verifies if the currently logged in Clerk user has ADMIN or SUPERADMIN privileges.
 * Automatically saves all logged in users into the database with appropriate roles.
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
      : `User ${user.email} is registered with role '${user.role}' in the database. Admin role is required to access the admin portal.`,
  };
}
