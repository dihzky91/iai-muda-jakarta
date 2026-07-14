import React, { useState, useEffect } from 'react';
import { UserRole, useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Check, ShieldCheck, Shield, Pencil } from 'lucide-react';

interface AppUser {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  admin: 'bg-blue-50 text-blue-700 border-blue-100',
  editor: 'bg-slate-100 text-slate-600 border-slate-200',
};

interface UserForm {
  username: string;
  password: string;
  role: UserRole;
}

const emptyForm: UserForm = { username: '', password: '', role: 'editor' };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users', { credentials: 'include' });
    const result = await res.json();
    if (result.success) setUsers(result.data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingId !== null) {
      // Update: only send changed fields
      const body: Record<string, string> = { role: form.role };
      if (form.password) body.password = form.password;

      const res = await fetch(`/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        triggerToast('User berhasil diperbarui!');
        setEditingId(null);
        setForm(emptyForm);
        fetchUsers();
      } else {
        triggerToast(`Gagal: ${result.message}`);
      }
    } else {
      // Create
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        triggerToast('User baru berhasil dibuat!');
        setForm(emptyForm);
        fetchUsers();
      } else {
        triggerToast(`Gagal: ${result.message}`);
      }
    }
    setSubmitting(false);
  };

  const handleEdit = (u: AppUser) => {
    setEditingId(u.id);
    setForm({ username: u.username, password: '', role: u.role });
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Hapus user "${username}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
    const result = await res.json();
    if (result.success) {
      triggerToast('User berhasil dihapus.');
      fetchUsers();
    } else {
      triggerToast(`Gagal: ${result.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-2xl border border-emerald-500/20">
          <Check className="h-5 w-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Form */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 space-y-5 shadow-sm">
        <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <span>{editingId !== null ? 'Edit User' : 'Buat User Baru'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Username</label>
            <input
              type="text"
              required={editingId === null}
              disabled={editingId !== null}
              placeholder="contoh: pengurus_humas"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Password {editingId !== null && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              required={editingId === null}
              placeholder={editingId !== null ? 'Kosongkan jika tidak diubah...' : 'Minimum 8 karakter...'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="editor">Editor — Edit events & gallery</option>
              <option value="admin">Admin — + Kelola pengurus</option>
              <option value="superadmin">Super Admin — Akses penuh</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            {editingId !== null && (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}
                className="w-1/3 rounded-xl bg-slate-100 text-slate-600 py-2.5 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer">
                Batal
              </button>
            )}
            <button type="submit" disabled={submitting}
              className={`rounded-xl font-bold py-2.5 text-xs text-white shadow-md cursor-pointer transition-all disabled:opacity-60 ${editingId !== null ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'}`}>
              {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Buat User'}
            </button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
        <h3 className="font-display text-lg font-bold text-slate-900">
          Daftar User ({users.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Memuat...</div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-2">
            {users.map(u => (
              <div key={u.id} className="pt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{u.username}</span>
                      {u.id === currentUser?.userId && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Anda</span>
                      )}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(u)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
                    title="Edit User">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {u.id !== currentUser?.userId && (
                    <button onClick={() => handleDelete(u.id, u.username)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-all cursor-pointer"
                      title="Hapus User">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
