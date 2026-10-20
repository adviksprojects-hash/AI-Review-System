'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  Crown,
  AlertCircle,
  User,
  Shield,
  Search,
  Database,
  Copy,
  Check,
} from 'lucide-react';

interface AdminTeamModalProps {
  onClose: () => void;
  currentEmail?: string;
}

interface UserAccountRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminTeamModal({ onClose, currentEmail }: AdminTeamModalProps) {
  const [accounts, setAccounts] = useState<UserAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/admins');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAccounts(json.data);
      } else {
        setError(json.error || 'Failed to fetch accounts');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCopySql = (email: string, role: string) => {
    const sql = `UPDATE "AdminUser" SET role = '${role}' WHERE email = '${email}';`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(email);
    setTimeout(() => setCopiedSql(null), 2500);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesFilter =
      filterRole === 'ALL' ||
      (filterRole === 'ADMIN' && (acc.role === 'ADMIN' || acc.role === 'SUPERADMIN')) ||
      (filterRole === 'USER' && acc.role === 'USER');

    const matchesSearch =
      !searchQuery.trim() ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (acc.name && acc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    return matchesFilter && matchesSearch;
  });

  const adminCount = accounts.filter((a) => a.role === 'ADMIN' || a.role === 'SUPERADMIN').length;
  const userCount = accounts.filter((a) => a.role === 'USER').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Database Accounts &amp; Roles</h3>
              <p className="text-xs text-slate-500">
                All accounts registered in your PostgreSQL database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Database Role Rules Notice */}
        <div className="mt-4 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Role Assignment: Managed Strictly in Database</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            By default, any new email logging in is automatically recorded as <strong className="font-extrabold text-blue-950">USER</strong>. To assign <strong className="font-extrabold text-blue-950">ADMIN</strong> privileges, update the role column directly in your Neon PostgreSQL database.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterRole('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterRole === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({accounts.length})
              </button>
              <button
                onClick={() => setFilterRole('ADMIN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterRole === 'ADMIN'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admins ({adminCount})</span>
              </button>
              <button
                onClick={() => setFilterRole('USER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterRole === 'USER'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Users ({userCount})</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Neon PostgreSQL
            </span>
          </div>
        </div>

        {/* Accounts List */}
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading database accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              No accounts found matching your query.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto rounded-xl border border-slate-200">
              {filteredAccounts.map((acc) => {
                const isCurrent = acc.email.toLowerCase() === currentEmail?.toLowerCase();
                const isUser = acc.role === 'USER';
                const isSuperAdmin = acc.role === 'SUPERADMIN';
                const isCopied = copiedSql === acc.email;

                return (
                  <div
                    key={acc.id}
                    className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUser
                            ? 'bg-slate-100 text-slate-600'
                            : isSuperAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-4 h-4" />
                        ) : isSuperAdmin ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {acc.name || acc.email.split('@')[0]}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                              You
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${
                              isUser
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : isSuperAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{acc.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Copy SQL update query for quick DB execution */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleCopySql(acc.email, isUser ? 'ADMIN' : 'USER')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="Copy SQL command to change role in Neon DB"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>SQL Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy DB SQL ({isUser ? '→ ADMIN' : '→ USER'})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
