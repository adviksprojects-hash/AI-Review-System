import { NextResponse } from 'next/server';
import { getBusinessByIdOrSlug, updateBusiness, deleteBusiness } from '@/lib/storage';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const business = await getBusinessByIdOrSlug(id);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error('Error retrieving business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve business' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const existing = await getBusinessByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const updated = await updateBusiness(existing.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const existing = await getBusinessByIdOrSlug(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteBusiness(existing.id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}
