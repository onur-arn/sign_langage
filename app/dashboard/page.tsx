'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/upload/FileUpload';
import VoiceInput from '@/components/VoiceInput';
import LanguageSelector from '@/components/LanguageSelector';

const SignAvatarPlayer = dynamic(() => import('@/components/SignAvatarPlayer'), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-2xl flex items-center justify-center bg-slate-900" style={{ minHeight: 'clamp(320px, 45vw, 580px)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#5ba4b0] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#5ba4b0] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Chargement de l'avatar…</p>
      </div>
    </div>
  ),
});

import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { dark } = useDarkMode();
  const [text, setText] = useState('');
  const [avatarText, setAvatarText] = useState<{ value: string; ts: number }>({ value: '', ts: 0 });
  const [inputLang, setInputLang] = useState<'fr' | 'en' | 'tr'>(language as 'fr' | 'en' | 'tr');

  // Synchronise inputLang quand l'utilisateur change la langue de l'interface
  useEffect(() => {
    setInputLang(language as 'fr' | 'en' | 'tr');
  }, [language]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: 'rgba(91,164,176,0.2)', borderTopColor: '#5ba4b0' }}></div>
          <p className="mt-6 font-medium" style={{ color: '#4a7a84' }}>{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleTranslate = (inputText: string) => {
    setText(inputText);
    setAvatarText({ value: inputText, ts: Date.now() });
  };



  const handleVoiceTranscript = (transcript: string) => {
    handleTranslate(transcript);
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  const bg      = dark ? '#05191e' : '#ffffff';
  const hdrBg   = dark ? '#07202a' : '#ffffff';
  const textMain = dark ? 'rgba(255,255,255,0.9)' : '#1e3a40';
  const textSub  = dark ? 'rgba(255,255,255,0.5)' : '#4a7a84';
  const cardBg   = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const border   = 'rgba(91,164,176,0.2)';
  const areaBg   = dark ? 'rgba(255,255,255,0.04)' : '#f9fefe';

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: bg }}>
      {/* Header */}
      <header className="border-b shadow-sm transition-colors duration-500" style={{ background: hdrBg, borderColor: border }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-3 sm:py-5">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-3xl font-bold truncate" style={{ color: textMain }}>
                {t.dashboard.title} <span className="font-light">{t.dashboard.titleBold}</span>
              </h1>
              <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 truncate" style={{ color: textSub }}>{session.user?.name || session.user?.email}</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <DarkModeToggle />
              <LanguageSelector variant="compact" />
              {(session.user as any)?.role === 'ADMIN' ? (
                <a
                  href="/admin"
                  className="w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 flex items-center justify-center rounded-xl font-medium text-sm border transition-all hover:shadow-md"
                  style={{ color: '#5ba4b0', borderColor: 'rgba(91,164,176,0.3)', background: cardBg }}
                >
                  <span className="hidden sm:inline">{t.dashboard.admin}</span>
                  <span className="sm:hidden text-base">⚙️</span>
                </a>
              ) : null}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 flex items-center justify-center text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer"
                style={{ background: '#5ba4b0' }}
              >
                <span className="hidden sm:inline">{t.dashboard.logout}</span>
                <span className="sm:hidden text-base leading-none">⏏</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">

          {/* Left Panel - Input */}
          <div className="flex flex-col gap-4 order-2 lg:order-1">

            {/* 1. Texte */}
            <div className="rounded-2xl border p-3 sm:p-5 transition-all hover:shadow-md" style={{ background: cardBg, borderColor: border }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">✍️</div>
                <h2 className="text-lg font-semibold" style={{ color: textMain }}>{t.dashboard.text}</h2>
                <div className="ml-auto flex gap-1 p-1 rounded-xl border" style={{ borderColor: border, background: areaBg }}>
                  {([
                    { code: 'fr', flag: '🇫🇷', label: 'FR' },
                    { code: 'en', flag: '🇬🇧', label: 'EN' },
                    { code: 'tr', flag: '🇹🇷', label: 'TR' },
                  ] as const).map(({ code, flag, label }) => (
                    <button
                      key={code}
                      onClick={() => setInputLang(code)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={inputLang === code
                        ? { background: '#5ba4b0', color: '#ffffff' }
                        : { color: textSub }
                      }
                    >
                      {flag} {label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="w-full p-3 sm:p-4 border rounded-xl focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] transition-all resize-none text-sm outline-none"
                style={{ borderColor: border, color: textMain, background: areaBg }}
                placeholder={t.dashboard.textPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleTranslate(text)}
                  disabled={!text.trim()}
                  className="flex-1 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm cursor-pointer"
                  style={{ background: '#5ba4b0' }}
                >
                  {t.dashboard.translate}
                </button>
                <button
                  onClick={() => setText('')}
                  disabled={!text.trim()}
                  className="shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md cursor-pointer"
                  style={{ background: 'rgba(91,164,176,0.12)', color: '#5ba4b0', border: '1px solid rgba(91,164,176,0.25)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. PDF + Voix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch flex-1">
              <div className="rounded-2xl border p-3 sm:p-5 transition-all hover:shadow-md" style={{ background: cardBg, borderColor: border }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">📄</div>
                  <h2 className="text-base font-semibold" style={{ color: textMain }}>{t.dashboard.pdf}</h2>
                </div>
                <FileUpload onTextExtracted={handleTranslate} />
              </div>

              <div className="rounded-2xl border p-3 sm:p-5 transition-all hover:shadow-md flex flex-col" style={{ background: cardBg, borderColor: border }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">🎤</div>
                  <h2 className="text-base font-semibold" style={{ color: textMain }}>{t.dashboard.voice}</h2>
                </div>
                <div className="flex-1 flex flex-col">
                  <VoiceInput onTranscript={handleVoiceTranscript} onCopyToText={(transcript) => setText(transcript)} />
                </div>
              </div>
            </div>

            {stats && (
              <div className="rounded-2xl border p-5" style={{ borderColor: border, background: areaBg }}>
                <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>{t.dashboard.stats}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl p-4 text-center shadow-sm" style={{ background: cardBg }}>
                    <p className="text-3xl font-bold" style={{ color: '#5ba4b0' }}>{stats.totalWords}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: textSub }}>{t.dashboard.words}</p>
                  </div>
                  <div className="rounded-xl p-4 text-center shadow-sm" style={{ background: cardBg }}>
                    <p className="text-3xl font-bold text-emerald-500">{stats.wordsWithSigns}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: textSub }}>{t.dashboard.translated}</p>
                  </div>
                  <div className="rounded-xl p-4 text-center shadow-sm" style={{ background: cardBg }}>
                    <p className="text-3xl font-bold text-amber-500">{stats.wordsWithoutSigns}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: textSub }}>{t.dashboard.missing}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Avatar */}
          <div className="order-1 lg:order-2">
            <div className="h-full rounded-2xl border p-3 sm:p-4 hover:shadow-lg transition-all" style={{ background: cardBg, borderColor: border }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🎥</div>
                <h2 className="text-lg font-semibold" style={{ color: textMain }}>{t.dashboard.result}</h2>
              </div>
              <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={inputLang} />
            </div>
          </div>

        </div>
      </main>

      {/* Partners & Footer */}
      <footer className="border-t mt-8 px-3 sm:px-4 md:px-8 pt-8 sm:pt-10 pb-6" style={{ borderColor: border }}>
        <div className="max-w-7xl mx-auto space-y-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: textSub }}>
            {language === 'fr' ? 'Partenaires & collaborateurs' : language === 'tr' ? 'Ortaklar & iş birlikçiler' : 'Partners & collaborators'}
          </p>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-5">
            {[
              { src: '/logo-project.jpg', alt: 'Project logo', h: 'h-10 sm:h-16' },
              { src: '/logo-letsdoitturkey.png', alt: "Let's Do It Turkey", h: 'h-10 sm:h-16' },
              { src: '/logo-youthstation.png', alt: 'Youth Station', h: 'h-10 sm:h-16' },
              { src: '/logo-ulusal-ajans.png', alt: 'Türkiye Ulusal Ajansı', h: 'h-8 sm:h-12' },
              { src: '/logo-eu.png', alt: 'Co-funded by the European Union', h: 'h-12 sm:h-20' },
            ].map((logo) => (
              <div key={logo.src}
                className="flex items-center justify-center rounded-2xl px-2 py-2 sm:px-3 sm:py-3 md:px-6 md:py-4 border transition-all"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#ffffff', borderColor: 'rgba(91,164,176,0.15)', boxShadow: '0 2px 12px rgba(91,164,176,0.08)' }}
              >
                <Image src={logo.src} alt={logo.alt} width={200} height={90} className={`object-contain ${logo.h} w-auto`} />
              </div>
            ))}
          </div>
          <div className="border-t pt-5 text-center" style={{ borderColor: 'rgba(91,164,176,0.12)' }}>
            <p className="text-xs" style={{ color: '#5ba4b0' }}>
              {language === 'fr' && <>Développé par </>}
              {language === 'en' && <>Developed by </>}
              {language === 'tr' && <>Geliştiren: </>}
              <span className="font-semibold">Onur Arslan</span>
              {' · '}
              {language === 'fr' && 'Contact : '}
              {language === 'en' && 'Contact: '}
              {language === 'tr' && 'İletişim: '}
              <a href="mailto:secretaire@youthstation.org" className="hover:underline" style={{ color: '#5ba4b0' }}>
                secretaire@youthstation.org
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
