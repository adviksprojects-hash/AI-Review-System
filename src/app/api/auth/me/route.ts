import { NextResponse } from 'next/server';
import { verifyAdminStatus } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await verifyAdminStatus();
  return NextResponse.json(status);
}
