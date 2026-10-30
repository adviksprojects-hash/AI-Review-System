// Pure client-safe URL Normalizers for the 4 social & contact platforms
export function formatWhatsAppUrl(rawPhone?: string, businessName?: string): string | null {
  if (!rawPhone || !rawPhone.trim()) return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;
  // If 10 digits (common for India mobile numbers), prefix 91
  const cleanNumber = digits.length === 10 ? `91${digits}` : digits;
  const greeting = encodeURIComponent(
    `Hello ${businessName ? businessName : ''}! I connected with you through your Contact QR code.`
  );
  return `https://wa.me/${cleanNumber}?text=${greeting}`;
}

export function formatInstagramUrl(rawHandle?: string): string | null {
  if (!rawHandle || !rawHandle.trim()) return null;
  const val = rawHandle.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }
  const handle = val.replace(/^@/, '').replace(/\/$/, '');
  return `https://instagram.com/${handle}`;
}

export function formatFacebookUrl(rawId?: string): string | null {
  if (!rawId || !rawId.trim()) return null;
  const val = rawId.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }
  const clean = val.replace(/^@/, '').replace(/\/$/, '');
  return `https://facebook.com/${clean}`;
}

export function formatYouTubeUrl(rawId?: string): string | null {
  if (!rawId || !rawId.trim()) return null;
  const val = rawId.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }
  const clean = val.replace(/\/$/, '');
  const handle = clean.startsWith('@') ? clean : `@${clean}`;
  return `https://youtube.com/${handle}`;
}
