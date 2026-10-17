import { NextResponse } from 'next/server';
import { getAllBusinesses, createBusiness } from '@/lib/storage';

export async function GET() {
  try {
    const businesses = await getAllBusinesses();
    return NextResponse.json({ success: true, data: businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, placeId, category, city, keywords, customPrompt, customSlug, geminiApiKey } = body;

    if (!name || !placeId || !category || !city) {
      return NextResponse.json(
        { success: false, error: 'Name, Place ID, Category, and City are required' },
        { status: 400 }
      );
    }

    const newBusiness = await createBusiness({
      name,
      placeId,
      category,
      city,
      keywords: keywords || [],
      customPrompt,
      customSlug,
      geminiApiKey,
    });

    return NextResponse.json({ success: true, data: newBusiness }, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create business' },
      { status: 500 }
    );
  }
}
