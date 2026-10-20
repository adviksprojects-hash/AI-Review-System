'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  Crown,
  AlertCircle,
  User,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
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

  // New account form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [submitting, setSubmitting] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

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

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim() || null,
          role: newRole,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewEmail('');
        setNewName('');
        fetchAccounts();
      } else {
        setError(json.error || 'Failed to add account');
      }
    } catch (err: any) {
      setError(err?.message || 'Error adding account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (email: string, targetRole: 'USER' | 'ADMIN' | 'SUPERADMIN') => {
    try {
      setUpdatingEmail(email);
      setError(null);
      const res = await fetch('/api/auth/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: targetRole }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAccounts();
      } else {
        alert(json.error || 'Failed to update role');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating role');
    } finally {
      setUpdatingEmail(null);
    }
  };

  const handleDeleteAccount = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === currentEmail?.toLowerCase()) {
      alert('You cannot delete your own active admin account.');
      return;
    }
    if (!confirm(`Are you sure you want to delete the record for ${emailToDelete}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/admins?email=${encodeURIComponent(emailToDelete)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchAccounts();
      } else {
        alert(json.error || 'Failed to remove account');
      }
    } catch (err: any) {
      alert(err?.message || 'Error deleting account');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (filterRole === 'ADMIN') return acc.role === 'ADMIN' || acc.role === 'SUPERADMIN';
    if (filterRole === 'USER') return acc.role === 'USER';
    return true;
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
              <h3 className="text-base font-extrabold text-slate-900">Database Users &amp; Admins</h3>
              <p className="text-xs text-slate-500">
                All accounts logged in or registered in your PostgreSQL database.
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

        {/* Add New User / Admin Form */}
        <form onSubmit={handleAddAccount} className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add or Pre-Authorize Account</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="User Email (e.g. user@gmail.com)"
              required
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full Name (optional)"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Assign Role:</span>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none font-bold"
              >
                <option value="USER">USER (Standard Member)</option>
                <option value="ADMIN">ADMIN (Full Dashboard Access)</option>
                <option value="SUPERADMIN">SUPERADMIN (Owner)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {submitting ? 'Saving...' : 'Save to DB'}
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="mt-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
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
            Auto-synced on login
          </span>
        </div>

        {/* Accounts List */}
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading database accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              No accounts found in this category.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
              {filteredAccounts.map((acc) => {
                const isCurrent = acc.email.toLowerCase() === currentEmail?.toLowerCase();
                const isUser = acc.role === 'USER';
                const isSuperAdmin = acc.role === 'SUPERADMIN';
                const isUpdating = updatingEmail === acc.email;

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

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Promote to Admin or Demote to User */}
                      {!isCurrent && (
                        <>
                          {isUser ? (
                            <button
                              onClick={() => handleRoleChange(acc.email, 'ADMIN')}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 transition"
                              title="Promote to Admin"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Make Admin</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(acc.email, 'USER')}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-300 transition"
                              title="Demote to standard User"
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              <span>Make User</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteAccount(acc.email)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove account from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
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
