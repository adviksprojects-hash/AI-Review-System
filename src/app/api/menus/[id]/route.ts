import { NextResponse } from 'next/server';
import { getMenuBusinessByIdOrSlug, updateMenuBusiness, deleteMenuBusiness } from '@/lib/menuStorage';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const business = await getMenuBusinessByIdOrSlug(id);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Menu business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error('Error retrieving menu business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve menu business' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const existing = await getMenuBusinessByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Menu business not found' },
        { status: 404 }
      );
    }

    const updated = await updateMenuBusiness(existing.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating menu business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update menu business' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const existing = await getMenuBusinessByIdOrSlug(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Menu business not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteMenuBusiness(existing.id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting menu business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu business' },
      { status: 500 }
    );
  }
}
