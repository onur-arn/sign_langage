'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface User {
  id: string;
  name: string | null;
  email: string;
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

export default function AdminContent({ users, translations, signs }: AdminContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">🔧 {t.admin.title}</h1>
              <p className="text-sm text-slate-500 mt-1">Database Management</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold">{t.admin.signs}</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{signs.length}</p>
              </div>
              <div className="text-5xl">🤟</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-slate-900">👥 {t.admin.usersTable} ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{user.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{user.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signs Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50">
            <h2 className="text-2xl font-bold text-slate-900">🤟 {t.admin.signsTable} ({signs.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Word</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Animation URL</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {signs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-semibold mb-2">No signs in database</p>
                        <p className="text-sm">Run <code className="bg-slate-100 px-3 py-1 rounded-lg font-mono text-violet-600">npm run seed</code> to add test signs</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  signs.map((sign) => (
                    <tr key={sign.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{sign.word}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
                          {sign.category || 'uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono truncate max-w-xs">{sign.animationUrl}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(sign.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Text</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
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
