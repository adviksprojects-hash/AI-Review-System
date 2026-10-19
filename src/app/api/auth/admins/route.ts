import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminStatus } from '@/lib/auth';
import { getPrisma } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await verifyAdminStatus();
  if (!status.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const prisma = getPrisma();
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: admins });
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
    const role = body.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';

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
    const count = await prisma.adminUser.count();
    if (count <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the only remaining admin' },
        { status: 400 }
      );
    }

    await prisma.adminUser.delete({ where: { email } });
    return NextResponse.json({ success: true, message: 'Admin removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
