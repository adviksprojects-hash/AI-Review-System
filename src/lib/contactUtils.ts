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

export function getDisplayInstagram(rawHandle?: string | null): string {
  if (!rawHandle || !rawHandle.trim()) return 'Follow Us';
  let val = rawHandle.trim();
  val = val.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '');
  val = val.replace(/^@/, '');
  return val ? `@${val}` : 'Follow Us';
}

export function getDisplayYouTube(rawId?: string | null): string {
  if (!rawId || !rawId.trim()) return 'Watch Channel';
  let val = rawId.trim();
  val = val.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '').replace(/\/$/, '');
  if (val.startsWith('@')) return val;
  if (val.startsWith('c/') || val.startsWith('channel/')) {
    const part = val.split('/')[1];
    return part ? `@${part}` : '@channel';
  }
  return `@${val}`;
}

export function getDisplayFacebook(rawId?: string | null): string {
  if (!rawId || !rawId.trim()) return 'Official Page';
  let val = rawId.trim();
  val = val.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '');
  if (val.startsWith('profile.php') || val.startsWith('share/')) return 'Official Page';
  return val.length > 25 ? `${val.slice(0, 22)}...` : val;
}

export function getDisplayWhatsApp(rawPhone?: string | null): string {
  if (!rawPhone || !rawPhone.trim()) return 'Direct Chat';
  return rawPhone.trim();
}

