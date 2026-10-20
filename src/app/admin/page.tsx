'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  Globe,
  MapPin,
  Tag,
  HelpCircle,
  Database,
  Key,
  Download,
  Search,
  Building,
  UtensilsCrossed,
} from 'lucide-react';
import { Business, CreateBusinessInput, UpdateBusinessInput } from '@/lib/types';
import PrintableStandee from '@/components/PrintableStandee';
import MenuSection from '@/components/MenuSection';
import AdminTeamModal from '@/components/AdminTeamModal';
import { generateQrDataUrl } from '@/lib/qrcode';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import { ShieldCheck, ShieldAlert, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'menus'>('reviews');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Database Admin Verification State
  const [authCheck, setAuthCheck] = useState<{
    loading: boolean;
    isAdmin: boolean;
    profile: { email: string; name: string | null; role: string } | null;
    error?: string;
  }>({
    loading: true,
    isAdmin: false,
    profile: null,
  });
  const [isAdminTeamModalOpen, setIsAdminTeamModalOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [standeeBusiness, setStandeeBusiness] = useState<{
    business: Business;
    qrDataUrl: string;
    reviewUrl: string;
  } | null>(null);

  // QR Code Cache for preview
  const [qrCache, setQrCache] = useState<Record<string, string>>({});

  // Copy status
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    placeId: '',
    category: 'Restaurant & Cafe',
    city: '',
    keywords: '',
    customPrompt: '',
    customSlug: '',
    geminiApiKey: '',
    minRatingForRedirect: 4,
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/businesses');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBusinesses(json.data);
        generateQrCodesForList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        setAuthCheck({
          loading: false,
          isAdmin: Boolean(json.isAdmin),
          profile: json.adminProfile || null,
          error: json.error,
        });
        if (json.isAdmin) {
          fetchBusinesses();
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setAuthCheck({
          loading: false,
          isAdmin: false,
          profile: null,
          error: err?.message || 'Failed to verify admin status',
        });
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const generateQrCodesForList = async (list: Business[]) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const newCache: Record<string, string> = {};

    for (const b of list) {
      const url = `${origin}/r/${b.slug}`;
      try {
        const qrUrl = await generateQrDataUrl(url, { size: 300 });
        newCache[b.id] = qrUrl;
      } catch (e) {
        console.error('Failed to generate QR for', b.name, e);
      }
    }
    setQrCache((prev) => ({ ...prev, ...newCache }));
  };

  const getBusinessUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/r/${slug}`;
  };

  const handleCopyLink = async (business: Business) => {
    const url = getBusinessUrl(business.slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(business.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadQr = (business: Business) => {
    const qrUrl = qrCache[business.id];
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `google-review-qr-${business.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openStandeeModal = async (business: Business) => {
    const url = getBusinessUrl(business.slug);
    let qr = qrCache[business.id];
    if (!qr) {
      qr = await generateQrDataUrl(url, { size: 400 });
      setQrCache((prev) => ({ ...prev, [business.id]: qr }));
    }
    setStandeeBusiness({ business, qrDataUrl: qr, reviewUrl: url });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      placeId: '',
      category: 'Restaurant & Cafe',
      city: '',
      keywords: 'fast service, delicious taste, courteous staff, clean ambiance, authentic food',
      customPrompt: '',
      customSlug: '',
      geminiApiKey: '',
      minRatingForRedirect: 4,
    });
    setFormError(null);
    setEditingBusiness(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b: Business) => {
    setEditingBusiness(b);
    setFormData({
      name: b.name,
      placeId: b.placeId,
      category: b.category,
      city: b.city,
      keywords: b.keywords.join(', '),
      customPrompt: b.customPrompt || '',
      customSlug: b.slug,
      geminiApiKey: b.geminiApiKey || '',
      minRatingForRedirect: b.minRatingForRedirect ?? 4,
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.placeId.trim() || !formData.category.trim() || !formData.city.trim()) {
      setFormError('Business Name, Place ID, Category, and City are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingBusiness) {
        // Update existing business (preserves permanent slug/URL)
        const res = await fetch(`/api/businesses/${editingBusiness.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            placeId: formData.placeId,
            category: formData.category,
            city: formData.city,
            keywords: formData.keywords,
            customPrompt: formData.customPrompt,
            geminiApiKey: formData.geminiApiKey,
            minRatingForRedirect: Number(formData.minRatingForRedirect || 4),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsAddModalOpen(false);
          fetchBusinesses();
        } else {
          setFormError(json.error || 'Failed to update business');
        }
      } else {
        // Create new business
        const res = await fetch('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            minRatingForRedirect: Number(formData.minRatingForRedirect || 4),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsAddModalOpen(false);
          fetchBusinesses();
        } else {
          setFormError(json.error || 'Failed to create business');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      setFormError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusiness = async (b: Business) => {
    if (!confirm(`Are you sure you want to delete "${b.name}"?`)) return;

    try {
      const res = await fetch(`/api/businesses/${b.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setBusinesses((prev) => prev.filter((item) => item.id !== b.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.placeId.toLowerCase().includes(q)
    );
  });

  if (authCheck.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700">Verifying Database Admin Privileges...</p>
        </div>
      </div>
    );
  }

  if (!authCheck.isAdmin) {
    const isRegisteredUser = authCheck.profile?.role === 'USER';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-5 border border-slate-200">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
              isRegisteredUser ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isRegisteredUser ? <Users className="w-9 h-9" /> : <ShieldAlert className="w-9 h-9" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {isRegisteredUser ? 'Registered as Member' : 'Access Restricted'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegisteredUser ? 'Account Saved in PostgreSQL Database' : 'Database Admin Role Required'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 text-left leading-relaxed space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Account:</span>
              <span className="font-mono text-[11px] font-bold text-slate-900 truncate max-w-[200px]">
                {authCheck.profile?.email || 'Authenticated User'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Database Role:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                {authCheck.profile?.role || 'USER'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Database Status:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active in Database</span>
              </span>
            </div>
            <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
              {isRegisteredUser
                ? 'Your account has been saved in the Neon PostgreSQL database. An administrator can grant you full Admin Portal access from the Team Manager.'
                : 'Only accounts with the ADMIN role in the database can manage businesses and digital menus.'}
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <a
              href="/"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>Go to Public Homepage</span>
            </a>
            <SignOutButton>
              <button className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
                Google Place AI Review System
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Admin Hub
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Multi-Language Gemini AI Review Booster with Permanent QR Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Link to Public Home */}
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-xs border border-slate-200"
              title="Go to Public Homepage"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Public Home</span>
            </a>

            {/* Database Admin Badge & Management Button */}
            <button
              onClick={() => setIsAdminTeamModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition shadow-xs"
              title="Manage database authorized admin accounts"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">DB Admin:</span>
              <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px] font-extrabold uppercase">
                {authCheck.profile?.role || 'ADMIN'}
              </span>
            </button>

            {/* Section Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'reviews'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Reviews</span>
              </button>
              <button
                onClick={() => setActiveTab('menus')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'menus'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                <span>Menu QR System</span>
              </button>
            </div>

            {activeTab === 'reviews' && (
              <button
                onClick={handleOpenAdd}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Review Place</span>
              </button>
            )}

            {/* Admin Profile & Logout */}
            <div className="pl-2 border-l border-slate-200 flex items-center">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-lg border border-slate-200 shadow-xs',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab === 'menus' ? (
          <MenuSection />
        ) : (
          <>
            {/* System Capabilities & Setup Banner */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>⚡ System Status & Integrations</span>
              </h2>
              <p className="text-xs text-slate-500">
                Supports Gemini 1.5 Flash / 2.0 Flash AI &amp; Neon Postgres. Automatically switches when keys are placed in <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>Languages: English, हिंदी, मराठी</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini AI: Ready</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Neon DB / Local Store: Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business name, city, category, or Place ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Total Businesses: <strong>{businesses.length}</strong></span>
          </div>
        </div>

        {/* Business Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-sm text-slate-500">Loading business directory...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No businesses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'No businesses matched your search query. Try another keyword.'
                : 'Click the button below to register your first business with Google Place ID!'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Business
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredBusinesses.map((b) => {
              const url = getBusinessUrl(b.slug);
              const qr = qrCache[b.id];
              const isCopied = copiedId === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {b.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {b.city}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                          {b.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Business Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBusiness(b)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Business"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Place ID & Google Direct Review Link */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Google Place ID:</span>
                        <code className="bg-white px-2 py-0.5 rounded text-slate-800 font-mono text-[11px] border border-slate-200">
                          {b.placeId}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Permanent Slug:</span>
                        <code className="text-blue-600 font-mono text-[11px]">
                          /r/{b.slug}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-slate-500 font-medium">Gemini Tokens:</span>
                        {b.geminiApiKey ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Key className="w-2.5 h-2.5 text-purple-600" />
                            Business Dedicated Key
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            System Default Key
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Keywords Chips */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        AI Generation Keywords:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* QR Preview & Permanent Link */}
                    <div className="pt-2 flex items-center gap-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-3 rounded-xl border border-blue-100/60">
                      <div className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex-shrink-0 flex items-center justify-center">
                        {qr ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qr}
                            alt={`QR for ${b.name}`}
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={() => openStandeeModal(b)}
                          />
                        ) : (
                          <QrCode className="w-8 h-8 text-slate-300 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[11px] font-bold text-slate-700">Permanent Review URL:</p>
                        <p className="text-xs text-blue-600 truncate font-mono bg-white/80 px-2 py-1 rounded border border-blue-200/60">
                          {url}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCopyLink(b)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
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
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600"
                          >
                            <span>Open Review Page</span>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Print Standee / PNG</span>
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
        </>
      )}
      </main>

      {/* Add / Edit Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingBusiness ? 'Edit Business Details' : 'Register New Business'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingBusiness
                ? 'Update information below. The QR code and permanent URL will stay 100% stable.'
                : 'Enter your business details and Google Place ID to generate the AI review booster.'}
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hotel Shiv Sagar Pure Veg"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Google Place ID *
                  </label>
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>How to find Place ID?</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  required
                  value={formData.placeId}
                  onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Review link will automatically point to Google Review submission for this Place ID.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Restaurant, Dental Clinic, Salon"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    placeholder="e.g. Pune, Mumbai, Thane"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keywords / Features for Gemini AI *
                </label>
                <input
                  type="text"
                  required
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g. delicious food, quick service, polite staff, clean ambiance"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Separate with commas. Gemini AI blends these natural keywords into the 5 review variations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom AI Prompt / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.customPrompt}
                  onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                  placeholder="e.g. Emphasize authentic local spices, family-friendly seating, and free valet parking."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    Dedicated Gemini API Key for this Business (Optional)
                  </label>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Separate Billing & Quota
                  </span>
                </div>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy... (Leave empty to use shared system key)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 When provided, all review generations for this business will use this specific API key, ensuring token consumption and quotas remain dedicated to this business.
                </p>
              </div>

              {/* Smart Star Rating Redirect Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Redirect to Google Place Reviews For Ratings
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Smart Negative Filter
                  </span>
                </div>
                <select
                  value={formData.minRatingForRedirect}
                  onChange={(e) => setFormData({ ...formData, minRatingForRedirect: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value={4}>4 Stars &amp; 5 Stars only (Recommended - Filters out 1, 2 &amp; 3 stars)</option>
                  <option value={5}>5 Stars only (Strict Filter - Only 5★ goes to Google)</option>
                  <option value={3}>3 Stars &amp; above (Allows 3★, 4★, 5★ to Google)</option>
                  <option value={2}>2 Stars &amp; above (Allows 2★ to 5★ to Google)</option>
                  <option value={1}>No Restriction (All 1 to 5 stars redirect to Google)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  🛡️ Any customer rating below this threshold will <strong>NOT</strong> be redirected to Google. Instead, an apology &amp; thank-you message will be displayed and their private feedback recorded.
                </p>
              </div>

              {!editingBusiness && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Permanent Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customSlug}
                    onChange={(e) => setFormData({ ...formData, customSlug: e.target.value })}
                    placeholder="e.g. my-restaurant-pune (leave blank to auto-generate)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBusiness ? 'Update Business' : 'Create & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standee Modal */}
      {standeeBusiness && (
        <PrintableStandee
          business={standeeBusiness.business}
          qrDataUrl={standeeBusiness.qrDataUrl}
          reviewUrl={standeeBusiness.reviewUrl}
          onClose={() => setStandeeBusiness(null)}
        />
      )}

      {/* Database Admin Management Modal */}
      {isAdminTeamModalOpen && (
        <AdminTeamModal
          onClose={() => setIsAdminTeamModalOpen(false)}
          currentEmail={authCheck.profile?.email}
        />
      )}
    </div>
  );
}
