'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { GridAnimation } from '@/components/GridAnimation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { dark } = useDarkMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'fr' as const, flag: '🇫🇷' },
    { code: 'en' as const, flag: '🇬🇧' },
    { code: 'tr' as const, flag: '🇹🇷' },
  ];

  const cardBg   = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const cardBorder = dark ? 'rgba(91,164,176,0.25)' : 'rgba(91,164,176,0.2)';
  const textMain  = dark ? 'rgba(255,255,255,0.9)' : '#1e3a40';
  const textSub   = dark ? 'rgba(255,255,255,0.5)' : '#4a7a84';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputBorder = dark ? 'rgba(91,164,176,0.3)' : 'rgba(91,164,176,0.3)';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 z-0"><GridAnimation dark={dark} /></div>

      {/* Top bar */}
      <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-6">
        <DarkModeToggle variant="overlay" />
        <div className="backdrop-blur-xl border rounded-2xl p-1.5 flex gap-1"
          style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', borderColor: 'rgba(91,164,176,0.25)' }}>
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className="px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
              style={language === lang.code
                ? { background: '#5ba4b0', color: '#ffffff' }
                : { color: dark ? 'rgba(255,255,255,0.7)' : '#5ba4b0' }}>
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-20 border p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-md backdrop-blur-sm transition-colors duration-500"
        style={{ background: cardBg, borderColor: cardBorder, boxShadow: '0 8px 40px rgba(91,164,176,0.12)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: '#5ba4b0' }}>
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: textMain }}>{t.auth.loginTitle}</h1>
          <p style={{ color: textSub }}>{t.auth.loginSubtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.email}</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] transition-all outline-none placeholder:text-slate-400"
              style={{ background: inputBg, borderColor: inputBorder, color: textMain }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.password}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 pr-14 border rounded-2xl focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] transition-all outline-none placeholder:text-slate-400"
                style={{ background: inputBg, borderColor: inputBorder, color: textMain }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#4a7a84' }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-4 rounded-2xl font-semibold cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
            style={{ background: '#5ba4b0' }}
          >
            {loading ? `${t.auth.loginButton}...` : t.auth.loginButton}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm" style={{ color: textSub }}>
            {t.auth.noAccount}{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#5ba4b0' }}>
              {t.auth.createLink}
            </Link>
          </p>
          <Link href="/" className="block text-sm transition-colors hover:underline" style={{ color: '#5ba4b0' }}>
            {t.auth.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
