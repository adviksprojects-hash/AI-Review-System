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
