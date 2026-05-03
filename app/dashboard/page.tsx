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
  const { t } = useLanguage();
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
              <a
                href="/admin"
                className="px-6 py-2.5 text-slate-700 rounded-xl hover:bg-slate-100 transition-all font-medium text-sm border border-slate-200"
              >
                {t.dashboard.admin}
              </a>
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
      <main className="relative max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 hover:border-violet-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">📄</div>
                <h2 className="text-2xl font-semibold text-slate-900">{t.dashboard.pdf}</h2>
              </div>
              <FileUpload onTextExtracted={handleTranslate} />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 hover:border-indigo-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🎤</div>
                <h2 className="text-2xl font-semibold text-slate-900">{t.dashboard.voice}</h2>
              </div>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 hover:border-purple-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">✍️</div>
                <h2 className="text-2xl font-semibold text-slate-900">{t.dashboard.text}</h2>
              </div>
              <textarea
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition-all resize-none text-slate-900 placeholder:text-slate-400"
                placeholder={t.dashboard.textPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
              />
              <button
                onClick={() => handleTranslate(text)}
                disabled={!text.trim() || isTranslating}
                className="mt-5 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isTranslating ? t.dashboard.translating : t.dashboard.translate}
              </button>
            </div>

            {stats && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-violet-200 p-8 shadow-md">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">{t.dashboard.stats}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    <p className="text-4xl font-bold text-violet-600">{stats.totalWords}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{t.dashboard.words}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    <p className="text-4xl font-bold text-emerald-600">{stats.wordsWithSigns}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{t.dashboard.translated}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    <p className="text-4xl font-bold text-amber-600">{stats.wordsWithoutSigns}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{t.dashboard.missing}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Avatar */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🎥</div>
                <h2 className="text-2xl font-semibold text-slate-900">{t.dashboard.result}</h2>
              </div>
              <SignAvatarPlayer text={avatarText.value} ts={avatarText.ts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
