import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string, options?: { size?: number }): Promise<string> {
  const width = options?.size || 400;
  return QRCode.toDataURL(text, {
    width,
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateQrWithLogo(
  text: string,
  logoSrc: string,
  options?: { size?: number }
): Promise<string> {
  const size = options?.size || 400;

  // Server-side fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return generateQrDataUrl(text, { size });
  }

  // Create in-memory canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // Generate QR code with High (H) error correction (allows up to 30% center overlay without scan loss)
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  // Load logo image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = logoSrc;
  });

  if (img.width > 0 && img.height > 0) {
    // Logo width proportional to QR size (20%)
    const logoW = Math.round(size * 0.20);
    const aspect = img.width / img.height;
    const logoH = Math.round(logoW / aspect);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.round(Math.max(logoW, logoH) / 2 + 5);

    ctx.save();
    // Seamless white circular clearing baked directly into QR pixels - NO border, NO stroke, NO sticker look
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw logo directly onto the canvas
    const imgX = Math.round(centerX - logoW / 2);
    const imgY = Math.round(centerY - logoH / 2);
    ctx.drawImage(img, imgX, imgY, logoW, logoH);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}
