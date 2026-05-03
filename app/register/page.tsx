'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { GridAnimation } from '@/components/GridAnimation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { dark } = useDarkMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (formData.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Une erreur est survenue'); setLoading(false); return; }
      setSuccess(true);
    } catch { setError('Une erreur est survenue'); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const languages = [
    { code: 'fr' as const, flag: '🇫🇷' },
    { code: 'en' as const, flag: '🇬🇧' },
    { code: 'tr' as const, flag: '🇹🇷' },
  ];

  const cardBg    = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const cardBorder = dark ? 'rgba(91,164,176,0.25)' : 'rgba(91,164,176,0.2)';
  const textMain  = dark ? 'rgba(255,255,255,0.9)' : '#1e3a40';
  const textSub   = dark ? 'rgba(255,255,255,0.5)' : '#4a7a84';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputBorder = 'rgba(91,164,176,0.3)';
  const inputStyle = { background: inputBg, borderColor: inputBorder, color: textMain };
  const inputClass = "w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] transition-all outline-none placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 z-0"><GridAnimation dark={dark} /></div>

      {/* Top bar */}
      <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-6">
        <DarkModeToggle variant="overlay" />
        <div className="backdrop-blur-xl border rounded-2xl p-1.5 flex gap-1"
          style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', borderColor: 'rgba(91,164,176,0.25)' }}>
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className="px-3 py-2 rounded-xl text-sm transition-all"
              style={language === lang.code
                ? { background: '#5ba4b0', color: '#ffffff' }
                : { color: dark ? 'rgba(255,255,255,0.7)' : '#5ba4b0' }}>
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-20 border p-10 rounded-3xl shadow-xl w-full max-w-md backdrop-blur-sm transition-colors duration-500"
        style={{ background: cardBg, borderColor: cardBorder, boxShadow: '0 8px 40px rgba(91,164,176,0.12)' }}>
        {success ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: '#5ba4b0' }}>
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: textMain }}>Demande envoyée !</h2>
            <p className="mb-8" style={{ color: textSub }}>
              Votre demande est <strong style={{ color: textMain }}>en attente de validation</strong> de la part de l'administrateur.<br />
              Vous recevrez un email dès que votre compte sera approuvé.
            </p>
            <Link href="/login"
              className="inline-block px-8 py-3 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
              style={{ background: '#5ba4b0' }}>
              {t.auth.backToLogin}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#5ba4b0' }}>
                <span className="text-3xl">✨</span>
              </div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: textMain }}>{t.auth.registerTitle}</h1>
              <p style={{ color: textSub }}>{t.auth.registerSubtitle}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.name}</label>
                <input name="name" type="text" placeholder="Onur Arslan" value={formData.name} onChange={handleChange}
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.email}</label>
                <input name="email" type="email" placeholder="exemple@email.com" value={formData.email} onChange={handleChange} required
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.password}</label>
                <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textMain }}>{t.auth.confirmPassword}</label>
                <input name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required
                  className={inputClass} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full text-white py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
                style={{ background: '#5ba4b0' }}>
                {loading ? `${t.auth.registerButton}...` : t.auth.registerButton}
              </button>
            </form>

            <div className="mt-8 text-center space-y-3">
              <p className="text-sm" style={{ color: textSub }}>
                {t.auth.hasAccount}{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: '#5ba4b0' }}>{t.auth.loginLink}</Link>
              </p>
              <Link href="/" className="block text-sm transition-colors hover:underline" style={{ color: '#5ba4b0' }}>{t.auth.backHome}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
