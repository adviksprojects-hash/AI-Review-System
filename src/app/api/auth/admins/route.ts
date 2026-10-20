import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminStatus } from '@/lib/auth';
import { getPrisma } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Returns all database accounts (Admins and Users) for authorized admins to view.
 * Role changes are restricted strictly to direct database management (PostgreSQL).
 */
export async function GET(req: NextRequest) {
  const status = await verifyAdminStatus();
  if (!status.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');

    const prisma = getPrisma();
    const accounts = await prisma.adminUser.findMany({
      where: roleFilter ? { role: roleFilter } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
