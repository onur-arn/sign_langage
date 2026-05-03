'use client';

import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const LANGUAGES = [
  { code: 'fr-FR', name: '🇫🇷 Français', flag: '🇫🇷' },
  { code: 'en-GB', name: '🇬🇧 Anglais (UK)', flag: '🇬🇧' },
  { code: 'en-US', name: '🇺🇸 Anglais (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: '🇪🇸 Espagnol', flag: '🇪🇸' },
  { code: 'de-DE', name: '🇩🇪 Allemand', flag: '🇩🇪' },
  { code: 'it-IT', name: '🇮🇹 Italien', flag: '🇮🇹' },
  { code: 'nl-NL', name: '🇳🇱 Néerlandais', flag: '🇳🇱' },
  { code: 'pt-PT', name: '🇵🇹 Portugais', flag: '🇵🇹' },
  { code: 'tr-TR', name: '🇹🇷 Turc', flag: '🇹🇷' },
  { code: 'ru-RU', name: '🇷🇺 Russe', flag: '🇷🇺' },
  { code: 'zh-CN', name: '🇨🇳 Chinois', flag: '🇨🇳' },
  { code: 'ja-JP', name: '🇯🇵 Japonais', flag: '🇯🇵' },
];

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [selectedLang, setSelectedLang] = useState('fr-FR');
  const { isListening, setIsListening, transcript, setTranscript, isSupported, error } = useSpeechRecognition({ language: selectedLang });

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
    <div className="w-full space-y-4">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
          <p className="font-medium mb-1">⚠️ Erreur</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isListening}
          className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 hover:border-sky-300 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-medium transition-all ${
            isListening
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:shadow-lg text-white animate-pulse'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:shadow-lg hover:scale-[1.02] text-white'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {isListening ? 'Arrêter l\'enregistrement' : 'Commencer à parler'}
        </button>

        {transcript && (
          <button
            onClick={handleClear}
            className="px-5 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-sm text-rose-700 font-medium">Écoute en cours...</span>
        </div>
      )}

      {transcript && (
        <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl">
          <p className="text-sm text-slate-600 mb-2 font-medium">Transcription:</p>
          <p className="text-slate-800">{transcript}</p>
        </div>
      )}
    </div>
  );
}
