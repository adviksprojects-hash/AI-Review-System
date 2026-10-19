'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserPlus, Trash2, Mail, Crown, AlertCircle } from 'lucide-react';

interface AdminTeamModalProps {
  onClose: () => void;
  currentEmail?: string;
}

interface AdminUserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminTeamModal({ onClose, currentEmail }: AdminTeamModalProps) {
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New admin form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/admins');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAdmins(json.data);
      } else {
        setError(json.error || 'Failed to fetch admins');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setAdding(true);
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
        fetchAdmins();
      } else {
        setError(json.error || 'Failed to add admin');
      }
    } catch (err: any) {
      setError(err?.message || 'Error adding admin');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAdmin = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === currentEmail?.toLowerCase()) {
      alert('You cannot delete your own active admin account.');
      return;
    }
    if (!confirm(`Are you sure you want to remove admin access for ${emailToDelete}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/admins?email=${encodeURIComponent(emailToDelete)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchAdmins();
      } else {
        alert(json.error || 'Failed to remove admin');
      }
    } catch (err: any) {
      alert(err?.message || 'Error deleting admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Database Authorized Admins</h3>
              <p className="text-xs text-slate-500">
                Only users registered in this table can access the admin portal.
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

        {/* Add New Admin Form */}
        <form onSubmit={handleAddAdmin} className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Admin to Database</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Admin Email (e.g. user@gmail.com)"
              required
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (optional)"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="ADMIN">Role: ADMIN</option>
              <option value="SUPERADMIN">Role: SUPERADMIN</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {adding ? 'Saving...' : 'Authorize Admin'}
            </button>
          </div>
        </form>

        {/* Existing Admin Users List */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold text-slate-700">Currently Authorized Accounts ({admins.length})</p>
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading admin roster...</div>
          ) : admins.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No admins found</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              {admins.map((adm) => {
                const isCurrent = adm.email.toLowerCase() === currentEmail?.toLowerCase();
                return (
                  <div key={adm.id} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{adm.name || adm.email}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                            You
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {adm.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{adm.email}</span>
                      </p>
                    </div>

                    {!isCurrent && admins.length > 1 && (
                      <button
                        onClick={() => handleDeleteAdmin(adm.email)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
