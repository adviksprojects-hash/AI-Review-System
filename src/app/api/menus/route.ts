import { NextResponse } from 'next/server';
import { getAllMenuBusinesses, createMenuBusiness } from '@/lib/menuStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const menus = await getAllMenuBusinesses();
    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, city, description, phone, menuImages, customSlug } = body;

    if (!name || !category || !city) {
      return NextResponse.json(
        { success: false, error: 'Restaurant Name, Category, and City are required' },
        { status: 400 }
      );
    }

    const newMenuBiz = await createMenuBusiness({
      name,
      category,
      city,
      description,
      phone,
      menuImages: Array.isArray(menuImages) ? menuImages : [],
      customSlug,
    });

    return NextResponse.json({ success: true, data: newMenuBiz }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu business' },
      { status: 500 }
    );
  }
}
