'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/upload/FileUpload';
import VoiceInput from '@/components/VoiceInput';
import LanguageSelector from '@/components/LanguageSelector';
import SignAvatarPlayer from '@/components/SignAvatarPlayer';

import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [text, setText] = useState('');
  const [avatarText, setAvatarText] = useState<{ value: string; ts: number }>({ value: '', ts: 0 });
  const [isTranslating, setIsTranslating] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleTranslate = async (inputText: string, fileUrl?: string) => {
    setText(inputText);
    setIsTranslating(true);
    try {
      setAvatarText({ value: inputText, ts: Date.now() });
    } catch (error) {
      console.error('Erreur de traduction:', error);
    } finally {
      setIsTranslating(false);
    }
  };



  const handleVoiceTranscript = (transcript: string) => {
    handleTranslate(transcript);
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-100/10 via-transparent to-transparent"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/60 backdrop-blur-xl bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {t.dashboard.title}<span className="font-light">{t.dashboard.titleBold}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">{session.user?.name || session.user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector variant="compact" />
              {(session.user as any)?.role === 'ADMIN' ? (
                <a
                  href="/admin"
                  className="px-6 py-2.5 text-slate-700 rounded-xl hover:bg-slate-100 transition-all font-medium text-sm border border-slate-200"
                >
                  {t.dashboard.admin}
                </a>
              ) : null}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
              >
                {t.dashboard.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left Panel - Input */}
          <div className="space-y-4">

            {/* 1. Texte — usage principal, en premier */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 hover:border-purple-300 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">✍️</div>
                <h2 className="text-lg font-semibold text-slate-900">{t.dashboard.text}</h2>
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition-all resize-none text-slate-900 placeholder:text-slate-400 text-sm"
                placeholder={t.dashboard.textPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
              />
              <button
                onClick={() => handleTranslate(text)}
                disabled={!text.trim() || isTranslating}
                className="mt-3 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {isTranslating ? t.dashboard.translating : t.dashboard.translate}
              </button>
            </div>

            {/* 2. PDF + Voix — côte à côte */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 hover:border-violet-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">📄</div>
                  <h2 className="text-base font-semibold text-slate-900">{t.dashboard.pdf}</h2>
                </div>
                <FileUpload onTextExtracted={handleTranslate} />
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">🎤</div>
                  <h2 className="text-base font-semibold text-slate-900">{t.dashboard.voice}</h2>
                </div>
                <VoiceInput onTranscript={handleVoiceTranscript} />
              </div>
            </div>

            {stats && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">{t.dashboard.stats}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-violet-600">{stats.totalWords}</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{t.dashboard.words}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-emerald-600">{stats.wordsWithSigns}</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{t.dashboard.translated}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-amber-600">{stats.wordsWithoutSigns}</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{t.dashboard.missing}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Avatar */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🎥</div>
                <h2 className="text-lg font-semibold text-slate-900">{t.dashboard.result}</h2>
              </div>
              <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} language={language} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
