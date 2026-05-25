'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FileUpload from '@/components/upload/FileUpload';
import VoiceInput from '@/components/VoiceInput';
import LanguageSelector from '@/components/LanguageSelector';
import SignAvatarPlayer from '@/components/SignAvatarPlayer';

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
  const [inputLang, setInputLang] = useState<'fr' | 'en' | 'tr'>('fr');
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
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: textMain }}>
                {t.dashboard.title} <span className="font-light">{t.dashboard.titleBold}</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: textSub }}>{session.user?.name || session.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <LanguageSelector variant="compact" />
              {(session.user as any)?.role === 'ADMIN' ? (
                <a
                  href="/admin"
                  className="px-5 py-2.5 rounded-xl font-medium text-sm border transition-all hover:shadow-md"
                  style={{ color: '#5ba4b0', borderColor: 'rgba(91,164,176,0.3)', background: cardBg }}
                >
                  {t.dashboard.admin}
                </a>
              ) : null}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-5 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md hover:scale-[1.02]"
                style={{ background: '#5ba4b0' }}
              >
                {t.dashboard.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left Panel - Input */}
          <div className="space-y-4">

            {/* 1. Texte */}
            <div className="rounded-2xl border p-6 transition-all hover:shadow-md" style={{ background: cardBg, borderColor: border }}>
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] transition-all resize-none text-sm outline-none"
                style={{ borderColor: border, color: textMain, background: areaBg }}
                placeholder={t.dashboard.textPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
              />
              <button
                onClick={() => handleTranslate(text)}
                disabled={!text.trim()}
                className="mt-3 w-full text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                style={{ background: '#5ba4b0' }}
              >
                {t.dashboard.translate}
              </button>
            </div>

            {/* 2. PDF + Voix */}
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div className="rounded-2xl border p-5 transition-all hover:shadow-md" style={{ background: cardBg, borderColor: border }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">📄</div>
                  <h2 className="text-base font-semibold" style={{ color: textMain }}>{t.dashboard.pdf}</h2>
                </div>
                <FileUpload onTextExtracted={handleTranslate} />
              </div>

              <div className="rounded-2xl border p-5 transition-all hover:shadow-md flex flex-col" style={{ background: cardBg, borderColor: border }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">🎤</div>
                  <h2 className="text-base font-semibold" style={{ color: textMain }}>{t.dashboard.voice}</h2>
                </div>
                <div className="flex-1 flex flex-col">
                  <VoiceInput onTranscript={handleVoiceTranscript} />
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
          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl border p-4 hover:shadow-lg transition-all" style={{ background: cardBg, borderColor: border }}>
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
      <footer className="border-t mt-8 px-8 pt-10 pb-6" style={{ borderColor: border }}>
        <div className="max-w-7xl mx-auto space-y-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: textSub }}>
            {language === 'fr' ? 'Partenaires & collaborateurs' : language === 'tr' ? 'Ortaklar & iş birlikçiler' : 'Partners & collaborators'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { src: '/logo-project.jpg', alt: 'Project logo', h: 'h-16' },
              { src: '/logo-youthstation.png', alt: 'Youth Station', h: 'h-16' },
              { src: '/logo-ulusal-ajans.png', alt: 'Türkiye Ulusal Ajansı', h: 'h-12' },
              { src: '/logo-eu.png', alt: 'Co-funded by the European Union', h: 'h-20' },
            ].map((logo) => (
              <div key={logo.src}
                className="rounded-2xl px-6 py-4 border transition-all"
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
