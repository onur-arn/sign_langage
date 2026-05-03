'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { getSignLabel } from '@/lib/signLabels';

interface User {
  id: string;
  name: string | null;
  email: string;
  status: string;
  role: string;
  createdAt: Date;
}

interface Translation {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    email: string;
  };
}

interface Sign {
  id: string;
  word: string;
  category: string | null;
  animationUrl: string;
  createdAt: Date;
}

interface AdminContentProps {
  users: User[];
  translations: Translation[];
  signs: Sign[];
}

export default function AdminContent(initial: AdminContentProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [users, setUsers] = useState(initial.users);
  const [translations, setTranslations] = useState(initial.translations);
  const [signs, setSigns] = useState(initial.signs);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => { setLastUpdate(new Date()); }, []);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users);
    setTranslations(data.translations);
    setSigns(data.signs);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const rejectedUsers = users.filter(u => u.status === 'REJECTED');

  const handleRoleChange = async (userId: string, role: 'USER' | 'ADMIN') => {
    setLoadingId(userId);
    await fetch('/api/admin/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    setLoadingId(null);
    router.refresh();
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`${t.admin.deleteConfirm} "${email}" ?`)) return;
    setLoadingId(userId);
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setLoadingId(null);
    router.refresh();
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    setLoadingId(userId);
    await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">🔧 {t.admin.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.admin.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector variant="compact" />
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                ← {t.admin.back}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">{t.admin.users}</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{users.length}</p>
                </div>
                <div className="text-5xl">👥</div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold">{t.admin.translations}</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{translations.length}</p>
                </div>
                <div className="text-5xl">📝</div>
              </div>
            </div>
          </div>
          <div className="ml-6 text-right text-xs text-slate-400 shrink-0">
            <p>{t.admin.lastUpdate}</p>
            <p className="font-mono">
              {lastUpdate ? `${String(lastUpdate.getHours()).padStart(2,'0')}:${String(lastUpdate.getMinutes()).padStart(2,'0')}:${String(lastUpdate.getSeconds()).padStart(2,'0')}` : '—'}
            </p>
            <button onClick={refresh} className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-all">
              ↻ {t.admin.refresh}
            </button>
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingUsers.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border-2 border-amber-300">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <h2 className="text-xl font-bold text-slate-900">{t.admin.pendingSection}</h2>
              <span className="ml-auto bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">{pendingUsers.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-amber-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name || '—'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(user.id, 'approve')}
                      disabled={loadingId === user.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {loadingId === user.id ? '…' : `✓ ${t.admin.approve}`}
                    </button>
                    <button
                      onClick={() => handleApproval(user.id, 'reject')}
                      disabled={loadingId === user.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {loadingId === user.id ? '…' : `✗ ${t.admin.reject}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comptes refusés */}
        {rejectedUsers.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border-2 border-red-200">
            <div className="px-6 py-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50 flex items-center gap-3">
              <span className="text-2xl">✗</span>
              <h2 className="text-xl font-bold text-slate-900">{t.admin.rejectedSection}</h2>
              <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{rejectedUsers.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {rejectedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-red-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name || '—'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <button
                    onClick={() => handleApproval(user.id, 'approve')}
                    disabled={loadingId === user.id}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {loadingId === user.id ? '…' : `✓ ${t.admin.approveAnyway}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-slate-900">👥 {t.admin.usersTable} ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colId}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colName}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colEmail}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colStatus}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colRole}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colAdminAccess}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colCreated}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colAction}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{user.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{user.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email === 'secretaire@youthstation.org' ? (
                        <span className="px-3 py-1.5 text-xs text-slate-400 italic">{t.admin.mainAccount}</span>
                      ) : user.role === 'ADMIN' ? (
                        <button
                          onClick={() => handleRoleChange(user.id, 'USER')}
                          disabled={loadingId === user.id}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-red-100 hover:text-red-700 transition-all disabled:opacity-50"
                        >
                          {loadingId === user.id ? '…' : `✕ ${t.admin.revokeAccess}`}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user.id, 'ADMIN')}
                          disabled={loadingId === user.id}
                          className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-200 transition-all disabled:opacity-50"
                        >
                          {loadingId === user.id ? '…' : `+ ${t.admin.grantAccess}`}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email !== 'secretaire@youthstation.org' && (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={loadingId === user.id}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          {loadingId === user.id ? '…' : `🗑 ${t.admin.deleteAccount}`}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mots disponibles */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">🤟 {t.admin.availableWords}</h2>
            <span className="ml-2 bg-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full">{signs.length}</span>
          </div>
          <div className="p-6">
            {signs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{t.admin.noWords}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...signs]
                  .sort((a, b) => getSignLabel(a.word, language).localeCompare(getSignLabel(b.word, language)))
                  .filter((sign, idx, arr) => {
                    const label = getSignLabel(sign.word, language);
                    return arr.findIndex(s => getSignLabel(s.word, language) === label) === idx;
                  })
                  .map((sign) => (
                  <span
                    key={sign.id}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium"
                    title={sign.word}
                  >
                    {getSignLabel(sign.word, language)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Translations Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h2 className="text-2xl font-bold text-slate-900">📝 {t.admin.translationsTable} ({translations.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colText}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colUser}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.admin.colCreated}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {translations.map((translation) => (
                  <tr key={translation.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate">
                      {translation.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{translation.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(translation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
