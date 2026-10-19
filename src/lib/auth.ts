import { currentUser } from '@clerk/nextjs/server';
import { getPrisma } from './storage';

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isFirstAdmin?: boolean;
}

/**
 * Verifies if the currently logged in Clerk user has an ADMIN role in Neon DB.
 * If the database has 0 admins (initial setup), the first logged in user is
 * automatically assigned the ADMIN role so the owner has seamless access.
 */
export async function verifyAdminStatus(): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminProfile: AdminProfile | null;
  error?: string;
}> {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        adminProfile: null,
        error: 'Not authenticated with Clerk',
      };
    }

    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        adminProfile: null,
        error: 'No email address found on user profile',
      };
    }

    const prisma = getPrisma();
    const normalizedEmail = email.toLowerCase().trim();

    // Check total admins in DB
    const totalAdmins = await prisma.adminUser.count();

    if (totalAdmins === 0) {
      // First user to sign in becomes primary ADMIN in DB
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'System Admin';
      const newAdmin = await prisma.adminUser.create({
        data: {
          email: normalizedEmail,
          name: fullName,
          role: 'ADMIN',
        },
      });

      return {
        isAuthenticated: true,
        isAdmin: true,
        adminProfile: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
          isFirstAdmin: true,
        },
      };
    }

    // Lookup user in Neon DB AdminUser table
    const dbAdmin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (dbAdmin && (dbAdmin.role === 'ADMIN' || dbAdmin.role === 'SUPERADMIN')) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        adminProfile: {
          id: dbAdmin.id,
          email: dbAdmin.email,
          name: dbAdmin.name,
          role: dbAdmin.role,
        },
      };
    }

    // User authenticated in Clerk but NOT an admin in the database
    return {
      isAuthenticated: true,
      isAdmin: false,
      adminProfile: null,
      error: 'User email is not registered with Admin privileges in the database.',
    };
  } catch (err: any) {
    console.error('Error verifying admin status:', err);
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminProfile: null,
      error: err?.message || 'Database error during admin verification',
    };
  }
}
