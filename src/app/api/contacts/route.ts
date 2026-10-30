import { NextResponse } from 'next/server';
import { getAllContactBusinesses, createContactBusiness } from '@/lib/contactStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contacts = await getAllContactBusinesses();
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contact businesses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, whatsappNo, instagramId, facebookId, youtubeId, customSlug } = body;

    if (!name || !name.trim() || !city || !city.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business Name and City are required' },
        { status: 400 }
      );
    }

    const newContactBiz = await createContactBusiness({
      name,
      city,
      whatsappNo,
      instagramId,
      facebookId,
      youtubeId,
      customSlug,
    });

    return NextResponse.json({ success: true, data: newContactBiz }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact business' },
      { status: 500 }
    );
  }
}
