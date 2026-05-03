'use client';

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";

export default function HomePage() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-100/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent"></div>
      
      {/* Language Selector - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-2 shadow-lg flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                language === lang.code
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="text-sm font-medium text-violet-600 bg-violet-50 px-5 py-2.5 rounded-full border border-violet-100">
                {t.hero.badge}
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-extralight text-slate-900 tracking-tight leading-none">
              {t.hero.title}
              <span className="block font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                {t.hero.titleBold}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="group relative px-10 py-4 bg-slate-900 text-white rounded-full font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <span className="relative z-10">{t.hero.cta}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 text-slate-900 rounded-full font-semibold border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-50 transition-all shadow-md"
            >
              {t.hero.login}
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            {/* PDF Feature */}
            <div className="group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 hover:border-violet-300 transition-all hover:shadow-xl hover:-translate-y-2 duration-300">
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative">
                <div className="text-5xl mb-5">📄</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{t.features.pdf.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.features.pdf.desc}
                </p>
              </div>
            </div>

            {/* Voice Feature */}
            <div className="group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl hover:-translate-y-2 duration-300">
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative">
                <div className="text-5xl mb-5">🎤</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{t.features.voice.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.features.voice.desc}
                </p>
              </div>
            </div>

            {/* Video Feature */}
            <div className="group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 hover:border-purple-300 transition-all hover:shadow-xl hover:-translate-y-2 duration-300">
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative">
                <div className="text-5xl mb-5">🎥</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{t.features.video.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.features.video.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
