import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminStatus } from '@/lib/auth';
import { getPrisma } from '@/lib/storage';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  const status = await verifyAdminStatus();
  if (!status.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();
    const name = body.name?.trim() || null;
    let role = 'USER';
    if (body.role === 'SUPERADMIN') role = 'SUPERADMIN';
    else if (body.role === 'ADMIN') role = 'ADMIN';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const prisma = getPrisma();
    const created = await prisma.adminUser.upsert({
      where: { email },
      create: { email, name, role },
      update: { name, role },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const status = await verifyAdminStatus();
  if (!status.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();
    const newRole = body.role;

    if (!email || !['USER', 'ADMIN', 'SUPERADMIN'].includes(newRole)) {
      return NextResponse.json({ success: false, error: 'Valid email and role required' }, { status: 400 });
    }

    const prisma = getPrisma();

    // If demoting from ADMIN to USER, ensure there's at least one other admin remaining
    if (newRole === 'USER') {
      const targetUser = await prisma.adminUser.findUnique({ where: { email } });
      if (targetUser && (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN')) {
        const adminCount = await prisma.adminUser.count({
          where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
        });
        if (adminCount <= 1) {
          return NextResponse.json(
            { success: false, error: 'Cannot demote the only remaining admin' },
            { status: 400 }
          );
        }
      }
    }

    const updated = await prisma.adminUser.update({
      where: { email },
      data: { role: newRole },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const status = await verifyAdminStatus();
  if (!status.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter required' }, { status: 400 });
    }

    const prisma = getPrisma();
    const targetUser = await prisma.adminUser.findUnique({ where: { email } });

    // If deleting an admin, ensure not deleting the only remaining admin
    if (targetUser && (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN')) {
      const adminCount = await prisma.adminUser.count({
        where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the only remaining admin' },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({ where: { email } });
    return NextResponse.json({ success: true, message: 'Account removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
