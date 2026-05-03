'use client';

import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const LANGUAGES_FR = [
  { code: 'fr-FR', name: '🇫🇷 Français' },
  { code: 'en-GB', name: '🇬🇧 Anglais (UK)' },
  { code: 'en-US', name: '🇺🇸 Anglais (US)' },
  { code: 'es-ES', name: '🇪🇸 Espagnol' },
  { code: 'de-DE', name: '🇩🇪 Allemand' },
  { code: 'it-IT', name: '🇮🇹 Italien' },
  { code: 'nl-NL', name: '🇳🇱 Néerlandais' },
  { code: 'pt-PT', name: '🇵🇹 Portugais' },
  { code: 'tr-TR', name: '🇹🇷 Turc' },
  { code: 'ru-RU', name: '🇷🇺 Russe' },
  { code: 'zh-CN', name: '🇨🇳 Chinois' },
  { code: 'ja-JP', name: '🇯🇵 Japonais' },
];

const LANGUAGES_EN = [
  { code: 'fr-FR', name: '🇫🇷 French' },
  { code: 'en-GB', name: '🇬🇧 English (UK)' },
  { code: 'en-US', name: '🇺🇸 English (US)' },
  { code: 'es-ES', name: '🇪🇸 Spanish' },
  { code: 'de-DE', name: '🇩🇪 German' },
  { code: 'it-IT', name: '🇮🇹 Italian' },
  { code: 'nl-NL', name: '🇳🇱 Dutch' },
  { code: 'pt-PT', name: '🇵🇹 Portuguese' },
  { code: 'tr-TR', name: '🇹🇷 Turkish' },
  { code: 'ru-RU', name: '🇷🇺 Russian' },
  { code: 'zh-CN', name: '🇨🇳 Chinese' },
  { code: 'ja-JP', name: '🇯🇵 Japanese' },
];

const LANGUAGES_TR = [
  { code: 'fr-FR', name: '🇫🇷 Fransızca' },
  { code: 'en-GB', name: '🇬🇧 İngilizce (UK)' },
  { code: 'en-US', name: '🇺🇸 İngilizce (US)' },
  { code: 'es-ES', name: '🇪🇸 İspanyolca' },
  { code: 'de-DE', name: '🇩🇪 Almanca' },
  { code: 'it-IT', name: '🇮🇹 İtalyanca' },
  { code: 'nl-NL', name: '🇳🇱 Hollandaca' },
  { code: 'pt-PT', name: '🇵🇹 Portekizce' },
  { code: 'tr-TR', name: '🇹🇷 Türkçe' },
  { code: 'ru-RU', name: '🇷🇺 Rusça' },
  { code: 'zh-CN', name: '🇨🇳 Çince' },
  { code: 'ja-JP', name: '🇯🇵 Japonca' },
];

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [selectedLang, setSelectedLang] = useState('fr-FR');
  const { t, language } = useLanguage();
  const { isListening, setIsListening, transcript, setTranscript, isSupported, error } = useSpeechRecognition({ language: selectedLang });
  const LANGUAGES = language === 'en' ? LANGUAGES_EN : language === 'tr' ? LANGUAGES_TR : LANGUAGES_FR;

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false);
      if (transcript) {
        onTranscript(transcript);
      }
    } else {
      setTranscript('');
      setIsListening(true);
    }
  };

  const handleClear = () => {
    setTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        La reconnaissance vocale n'est pas supportée par votre navigateur.
        Veuillez utiliser Chrome ou Edge.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 h-full">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Language select — full width */}
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        disabled={isListening}
        className="w-full px-3 py-2.5 border rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#5ba4b0] focus:border-[#5ba4b0] outline-none"
        style={{ borderColor: 'rgba(91,164,176,0.3)', color: '#1e3a40', background: '#f9fefe' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>

      {/* Listening indicator + transcript fill the middle */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: 'rgba(91,164,176,0.06)', borderColor: 'rgba(91,164,176,0.2)' }}>
          <div className="flex gap-1">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1 h-4 rounded-full animate-pulse" style={{ background: '#5ba4b0', animationDelay: `${d}ms` }} />
            ))}
          </div>
          <span className="text-sm font-medium" style={{ color: '#5ba4b0' }}>{t.dashboard.voiceListening}</span>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="flex-1 flex flex-col min-h-0 rounded-xl border overflow-hidden" style={{ background: 'rgba(91,164,176,0.04)', borderColor: 'rgba(91,164,176,0.2)' }}>
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#5ba4b0' }}>{t.dashboard.voiceTranscript}</p>
            <button onClick={handleClear} className="text-xs px-2 py-1 rounded-lg transition-all hover:shadow-sm"
              style={{ background: 'rgba(91,164,176,0.1)', color: '#5ba4b0' }}>
              {t.dashboard.voiceClear}
            </button>
          </div>
          <p className="px-3 pb-3 text-sm" style={{ color: '#1e3a40' }}>{transcript}</p>
        </div>
      )}

      {/* Speak / Stop button — pinned to bottom */}
      <div className="mt-auto">
        <button
          onClick={handleToggle}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all text-white ${isListening ? 'animate-pulse' : 'hover:shadow-md hover:scale-[1.01]'}`}
          style={{ background: isListening ? '#e11d48' : '#5ba4b0' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isListening ? t.dashboard.voiceStop : t.dashboard.voiceSpeak}
        </button>
      </div>
    </div>
  );
}
