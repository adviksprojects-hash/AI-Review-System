import { NextResponse } from 'next/server';
import {
  getContactBusinessByIdOrSlug,
  updateContactBusiness,
  deleteContactBusiness,
} from '@/lib/contactStorage';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const business = await getContactBusinessByIdOrSlug(id);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Contact business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error('Error retrieving contact business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contact business' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const existing = await getContactBusinessByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Contact business not found' },
        { status: 404 }
      );
    }

    const updated = await updateContactBusiness(existing.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating contact business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact business' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const existing = await getContactBusinessByIdOrSlug(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Contact business not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteContactBusiness(existing.id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting contact business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact business' },
      { status: 500 }
    );
  }
}
