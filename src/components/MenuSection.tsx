'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  UtensilsCrossed,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Printer,
  MapPin,
  Phone,
  Download,
  Search,
  Upload,
  Image as ImageIcon,
  X,
  BookOpen,
} from 'lucide-react';
import { MenuBusiness, MenuImage } from '@/lib/types';
import PrintableMenuStandee from '@/components/PrintableMenuStandee';
import { generateQrDataUrl } from '@/lib/qrcode';

export default function MenuSection() {
  const [menus, setMenus] = useState<MenuBusiness[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuBusiness | null>(null);
  const [standeeMenu, setStandeeMenu] = useState<{
    business: MenuBusiness;
    qrDataUrl: string;
    menuUrl: string;
  } | null>(null);

  // QR Cache
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    city: string;
    phone: string;
    description: string;
    customSlug: string;
    menuImages: MenuImage[];
  }>({
    name: '',
    category: 'Family Restaurant & Dining',
    city: '',
    phone: '',
    description: '',
    customSlug: '',
    menuImages: [],
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newImageTitle, setNewImageTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/menus');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMenus(json.data);
        generateQrCodes(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch menus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const generateQrCodes = async (list: MenuBusiness[]) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const newCache: Record<string, string> = {};

    for (const b of list) {
      const url = `${origin}/m/${b.slug}`;
      try {
        const qrUrl = await generateQrDataUrl(url, { size: 300 });
        newCache[b.id] = qrUrl;
      } catch (e) {
        console.error('Failed to generate QR for menu', b.name, e);
      }
    }
    setQrCache((prev) => ({ ...prev, ...newCache }));
  };

  const getMenuUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/m/${slug}`;
  };

  const handleCopyLink = async (b: MenuBusiness) => {
    const url = getMenuUrl(b.slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadQr = (b: MenuBusiness) => {
    const qrUrl = qrCache[b.id];
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `menu-qr-${b.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openStandeeModal = async (b: MenuBusiness) => {
    const url = getMenuUrl(b.slug);
    let qr = qrCache[b.id];
    if (!qr) {
      qr = await generateQrDataUrl(url, { size: 400 });
      setQrCache((prev) => ({ ...prev, [b.id]: qr }));
    }
    setStandeeMenu({ business: b, qrDataUrl: qr, menuUrl: url });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Family Restaurant & Dining',
      city: '',
      phone: '',
      description: 'Serving authentic culinary delights with fresh ingredients.',
      customSlug: '',
      menuImages: [],
    });
    setFormError(null);
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: MenuBusiness) => {
    setEditingMenu(b);
    setFormData({
      name: b.name,
      category: b.category,
      city: b.city,
      phone: b.phone || '',
      description: b.description || '',
      customSlug: b.slug,
      menuImages: b.menuImages || [],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle uploading image files from local disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          const newImg: MenuImage = {
            id: `img_${Date.now()}_${index}`,
            title: `Page ${formData.menuImages.length + index + 1}`,
            url: base64,
          };
          setFormData((prev) => ({
            ...prev,
            menuImages: [...prev.menuImages, newImg],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle adding image via URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const newImg: MenuImage = {
      id: `img_${Date.now()}`,
      title: newImageTitle.trim() || `Page ${formData.menuImages.length + 1}`,
      url: newImageUrl.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      menuImages: [...prev.menuImages, newImg],
    }));
    setNewImageUrl('');
    setNewImageTitle('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      menuImages: prev.menuImages.filter((_, i) => i !== index),
    }));
  };

  const handleImageTitleChange = (index: number, newTitle: string) => {
    setFormData((prev) => {
      const updated = [...prev.menuImages];
      updated[index] = { ...updated[index], title: newTitle };
      return { ...prev, menuImages: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.category.trim() || !formData.city.trim()) {
      setFormError('Restaurant Name, Category, and City are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingMenu) {
        const res = await fetch(`/api/menus/${editingMenu.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchMenus();
        } else {
          setFormError(json.error || 'Failed to update menu business');
        }
      } else {
        const res = await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchMenus();
        } else {
          setFormError(json.error || 'Failed to create menu business');
        }
      }
    } catch (err) {
      console.error('Menu save error:', err);
      setFormError('Network error while saving menu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: MenuBusiness) => {
    if (!confirm(`Are you sure you want to delete menu for "${b.name}"?`)) return;

    try {
      const res = await fetch(`/api/menus/${b.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMenus((prev) => prev.filter((item) => item.id !== b.id));
      }
    } catch (err) {
      console.error('Menu delete error:', err);
    }
  };

  const filtered = menus.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 rounded-2xl p-5 border border-amber-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>Contactless Digital Menu QR System</span>
            </h2>
            <p className="text-xs text-slate-600">
              Upload multi-page menu cards for hotels &amp; restaurants. Generates permanent table QR codes that never change when menu cards are updated!
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/25 transition transform active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant Menu</span>
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restaurants, city, cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Active Menus: <strong>{menus.length}</strong></span>
        </div>
      </div>

      {/* Grid of Menus */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500">Loading digital menus...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
          <UtensilsCrossed className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Restaurant Menus Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'No restaurants matched your search.'
              : 'Create your first hotel or restaurant menu with menu card images and table QR code!'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Restaurant Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((b) => {
            const url = getMenuUrl(b.slug);
            const qr = qrCache[b.id];
            const isCopied = copiedId === b.id;
            const images = b.menuImages || [];

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {b.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {b.city}
                        </span>
                        {b.phone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {b.phone}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-snug">
                        {b.name}
                      </h3>
                      {b.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {b.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Menu Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Menu Pages Gallery Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menu Pages ({images.length} {images.length === 1 ? 'Page' : 'Pages'})</span>
                      </span>
                    </div>

                    {images.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {images.slice(0, 4).map((img, i) => (
                          <div
                            key={img.id || i}
                            className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative group bg-slate-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.title || `Menu Page ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-center">
                              <span className="text-[10px] text-white font-bold leading-tight line-clamp-2">
                                {img.title || `P${i + 1}`}
                              </span>
                            </div>
                            {i === 3 && images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                +{images.length - 4} more
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-center text-xs text-amber-800">
                        No menu card images uploaded yet. Click edit to upload images!
                      </div>
                    )}
                  </div>

                  {/* QR Preview & Permanent Link */}
                  <div className="pt-2 flex items-center gap-4 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-3 rounded-xl border border-amber-200/60">
                    <div className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex-shrink-0 flex items-center justify-center">
                      {qr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qr}
                          alt={`Menu QR for ${b.name}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => openStandeeModal(b)}
                        />
                      ) : (
                        <QrCode className="w-8 h-8 text-amber-300 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">Permanent Table Menu URL:</p>
                      <p className="text-xs text-amber-800 truncate font-mono bg-white/80 px-2 py-1 rounded border border-amber-200/60">
                        {url}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopyLink(b)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <span className="text-slate-300">•</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-700"
                        >
                          <span>Open Menu</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openStandeeModal(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Menu Standee</span>
                  </button>

                  <button
                    onClick={() => handleDownloadQr(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>{editingMenu ? 'Edit Restaurant Menu' : 'Create Restaurant Menu'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add your restaurant details and upload menu card images. The permanent QR code and URL will remain 100% stable even if you change images in the future!
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Restaurant / Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Heritage Multi-Cuisine"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category / Cuisine *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Pure Veg, Family Dine, Cafe"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune, Mumbai, Nashik"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / Orders (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98220 12345"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Permanent Slug (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={Boolean(editingMenu)}
                    value={formData.customSlug}
                    onChange={(e) => setFormData({ ...formData, customSlug: e.target.value })}
                    placeholder="e.g. royal-heritage-pune"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Specialties (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Famous for Biryani, Tandoor, and authentic local thali meals."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Menu Card Images Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Menu Card Images ({formData.menuImages.length} Uploaded)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    PNG, JPG, WebP supported
                  </span>
                </div>

                {/* Upload from Computer/Phone */}
                <div className="bg-amber-50/60 p-4 rounded-xl border border-dashed border-amber-300 text-center mb-3">
                  <Upload className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">
                    Upload Menu Card Photos from your Device
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-2">
                    Select one or multiple menu card pages from your phone camera or files.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="menu-file-upload"
                  />
                  <label
                    htmlFor="menu-file-upload"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Images</span>
                  </label>
                </div>

                {/* Add Image by URL */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-600">
                    Or add via Image Web URL:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Page Title (e.g. Starters & Drinks)"
                      value={newImageTitle}
                      onChange={(e) => setNewImageTitle(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://example.com/menu1.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition flex-shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of Uploaded Images */}
                {formData.menuImages.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formData.menuImages.map((img, index) => (
                      <div
                        key={img.id || index}
                        className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={img.title}
                            onChange={(e) => handleImageTitleChange(index, e.target.value)}
                            placeholder={`Page ${index + 1}`}
                            className="w-full text-xs font-semibold px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {saving ? 'Saving Menu...' : editingMenu ? 'Update Menu' : 'Save & Generate Menu QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standee Modal */}
      {standeeMenu && (
        <PrintableMenuStandee
          business={standeeMenu.business}
          qrDataUrl={standeeMenu.qrDataUrl}
          menuUrl={standeeMenu.menuUrl}
          onClose={() => setStandeeMenu(null)}
        />
      )}
    </div>
  );
}
