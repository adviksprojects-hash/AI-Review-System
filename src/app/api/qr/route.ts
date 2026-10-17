import { NextResponse } from 'next/server';
import { generateQrDataUrl, generateQrSvg } from '@/lib/qrcode';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const format = searchParams.get('format') || 'dataUrl';

  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  try {
    if (format === 'svg') {
      const svg = await generateQrSvg(text);
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const dataUrl = await generateQrDataUrl(text, { size: 500 });
    return NextResponse.json({ success: true, dataUrl });
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
