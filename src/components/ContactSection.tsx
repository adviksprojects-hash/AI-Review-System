'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  MessageCircle,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Printer,
  MapPin,
  Download,
  Search,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { ContactBusiness, CreateContactBusinessInput, UpdateContactBusinessInput } from '@/lib/types';
import PrintableContactStandee from '@/components/PrintableContactStandee';
import { generateQrDataUrl } from '@/lib/qrcode';

export default function ContactSection() {
  const [contacts, setContacts] = useState<ContactBusiness[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<ContactBusiness | null>(null);
  const [standeeContact, setStandeeContact] = useState<{
    business: ContactBusiness;
    qrDataUrl: string;
    contactUrl: string;
  } | null>(null);

  // QR Cache
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    whatsappNo: string;
    instagramId: string;
    facebookId: string;
    youtubeId: string;
    customSlug: string;
  }>({
    name: '',
    city: '',
    whatsappNo: '',
    instagramId: '',
    facebookId: '',
    youtubeId: '',
    customSlug: '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setContacts(json.data);
        generateQrCodes(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch contact businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const generateQrCodes = async (list: ContactBusiness[]) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const newCache: Record<string, string> = {};

    for (const b of list) {
      const url = `${origin}/c/${b.slug}`;
      try {
        const qrUrl = await generateQrDataUrl(url, { size: 300 });
        newCache[b.id] = qrUrl;
      } catch (e) {
        console.error('Failed to generate QR for contact', b.name, e);
      }
    }
    setQrCache(newCache);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      city: '',
      whatsappNo: '',
      instagramId: '',
      facebookId: '',
      youtubeId: '',
      customSlug: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: ContactBusiness) => {
    setEditingContact(b);
    setFormData({
      name: b.name,
      city: b.city,
      whatsappNo: b.whatsappNo || '',
      instagramId: b.instagramId || '',
      facebookId: b.facebookId || '',
      youtubeId: b.youtubeId || '',
      customSlug: b.slug,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.city.trim()) {
      setFormError('Business Name and City are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingContact) {
        const res = await fetch(`/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
            whatsappNo: formData.whatsappNo,
            instagramId: formData.instagramId,
            facebookId: formData.facebookId,
            youtubeId: formData.youtubeId,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchContacts();
        } else {
          setFormError(json.error || 'Failed to update contact business');
        }
      } else {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
            whatsappNo: formData.whatsappNo,
            instagramId: formData.instagramId,
            facebookId: formData.facebookId,
            youtubeId: formData.youtubeId,
            customSlug: formData.customSlug,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchContacts();
        } else {
          setFormError(json.error || 'Failed to create contact business');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      setFormError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: ContactBusiness) => {
    if (!confirm(`Are you sure you want to delete Contact QR for "${b.name}"?`)) return;

    try {
      const res = await fetch(`/api/contacts/${b.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setContacts((prev) => prev.filter((item) => item.id !== b.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const copyUrl = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenStandee = (b: ContactBusiness) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const contactUrl = `${origin}/c/${b.slug}`;
    const qrDataUrl = qrCache[b.id] || '';
    setStandeeContact({ business: b, qrDataUrl, contactUrl });
  };

  const downloadQr = (b: ContactBusiness) => {
    const qr = qrCache[b.id];
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `${b.slug}-contact-qr.png`;
    a.click();
  };

  const filteredContacts = contacts.filter((b) => {
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>Smart Contact &amp; Social QR System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Contact Us &amp; Social Media Standees
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              Create instant Contact QR codes with 1-tap buttons for Instagram, YouTube, Facebook, and WhatsApp.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-black rounded-2xl shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Add Contact Business</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by business name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-medium"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Contact Places: <span className="text-slate-900 font-black">{contacts.length}</span>
        </div>
      </div>

      {/* Contact Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading contact businesses...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800">No Contact Businesses Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Get started by adding your first business contact details and generate instant standees.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact Business</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContacts.map((b) => {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const contactUrl = `${origin}/c/${b.slug}`;
            const qr = qrCache[b.id];

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md p-6 flex flex-col justify-between overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-rose-500 via-blue-500 to-emerald-500" />
                
                <div className="space-y-4 pt-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{b.city}</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Contact QR
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {b.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Slug: <span className="text-emerald-700 font-bold">/c/{b.slug}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Edit Business"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Business"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Platforms Configured Grid */}
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Connected Channels &amp; Handles:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* WhatsApp */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-black">W</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-500">WhatsApp</p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {b.whatsappNo || <span className="text-slate-400 font-normal italic">Not set</span>}
                          </p>
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            background:
                              'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                          }}
                        >
                          <span className="text-white text-[10px] font-black">I</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-500">Instagram</p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {b.instagramId ? (b.instagramId.startsWith('@') ? b.instagramId : `@${b.instagramId}`) : <span className="text-slate-400 font-normal italic">Not set</span>}
                          </p>
                        </div>
                      </div>

                      {/* Facebook */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-black">f</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-500">Facebook</p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {b.facebookId || <span className="text-slate-400 font-normal italic">Not set</span>}
                          </p>
                        </div>
                      </div>

                      {/* YouTube */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <div className="w-5 h-5 rounded-md bg-[#FF0000] flex items-center justify-center shrink-0">
                          <span className="text-white text-[9px] font-black">▶</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-500">YouTube</p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {b.youtubeId ? (b.youtubeId.startsWith('@') ? b.youtubeId : `@${b.youtubeId}`) : <span className="text-slate-400 font-normal italic">Not set</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR & URL Section */}
                  <div className="pt-1 flex items-center gap-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-blue-50/50 p-3.5 rounded-2xl border border-emerald-100">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                      {qr ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={qr}
                          alt={`QR for ${b.name}`}
                          className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
                          onClick={() => handleOpenStandee(b)}
                          title="Click to preview & print standee"
                        />
                      ) : (
                        <QrCode className="w-10 h-10 text-emerald-300 animate-pulse" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                        Permanent Contact URL:
                      </p>
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 font-mono bg-white/90 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 truncate block shadow-2xs"
                      >
                        {contactUrl}
                      </a>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          onClick={() => copyUrl(b.slug, b.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
                        >
                          {copiedId === b.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{copiedId === b.id ? 'Copied!' : 'Copy URL'}</span>
                        </button>

                        <a
                          href={contactUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
                        >
                          <span>Open Page</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                          onClick={() => downloadQr(b)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span>QR PNG</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    NFC &amp; Smart QR Enabled
                  </span>
                  <button
                    onClick={() => handleOpenStandee(b)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-emerald-500/20 active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Standee</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingContact ? 'Edit Contact Business' : 'Add New Contact Business'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure business name, city, WhatsApp, and social media handles.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADVIKS Softech & Solutions"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>

                {/* City */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Contact Platforms Info */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Contact &amp; Social Platform Details
                </p>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>WhatsApp Number</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 8600570542 or 8600570542"
                    value={formData.whatsappNo}
                    onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Opens a direct chat on WhatsApp when the customer clicks the WhatsApp icon.
                  </p>
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Instagram ID / Handle</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @adviks_softech or adviks_softech"
                    value={formData.instagramId}
                    onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Facebook ID / Page</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. advikssoftech or facebook.com/advikssoftech"
                    value={formData.facebookId}
                    onChange={(e) => setFormData({ ...formData, facebookId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>YouTube ID / Channel</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @advikssoftech or youtube.com/@advikssoftech"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>

                {/* Custom Slug (Only for new businesses) */}
                {!editingContact && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom URL Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. adviks-softech"
                      value={formData.customSlug}
                      onChange={(e) => setFormData({ ...formData, customSlug: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Leave empty to automatically generate a clean, permanent slug.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Create Contact QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standee Modal */}
      {standeeContact && (
        <PrintableContactStandee
          business={standeeContact.business}
          qrDataUrl={standeeContact.qrDataUrl}
          contactUrl={standeeContact.contactUrl}
          onClose={() => setStandeeContact(null)}
        />
      )}
    </div>
  );
}
