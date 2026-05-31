'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { SIGN_LABELS_FR, SIGN_LABELS_EN, SIGN_LABELS_TR } from '@/lib/signLabels';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
}

function firstLetter(label: string): string {
  const c = removeAccents(label.trim().toUpperCase())[0] ?? '#';
  return /[A-Z]/.test(c) ? c : '#';
}

export default function SignDictionary() {
  const { t, language } = useLanguage();
  const { dark } = useDarkMode();
  const [activeLetter, setActiveLetter] = useState<string>('A');
  const [search, setSearch] = useState('');

  const bg      = dark ? '#05191e' : '#ffffff';
  const cardBg  = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const border  = 'rgba(91,164,176,0.2)';
  const secBg   = dark ? 'rgba(91,164,176,0.06)' : 'rgba(91,164,176,0.04)';
  const textMain= dark ? 'rgba(255,255,255,0.9)' : '#1e3a40';
  const textSub = dark ? 'rgba(255,255,255,0.5)' : '#4a7a84';

  const labelsMap = useMemo<Record<string, string>>(() => {
    if (language === 'en') return SIGN_LABELS_EN;
    if (language === 'tr') return SIGN_LABELS_TR;
    return SIGN_LABELS_FR;
  }, [language]);

  // Build array [{signId, label}] sorted by label
  const allSigns = useMemo(() => {
    return Object.entries(labelsMap)
      .map(([signId, label]) => ({ signId, label }))
      .sort((a, b) =>
        removeAccents(a.label).localeCompare(removeAccents(b.label), undefined, { sensitivity: 'base' })
      );
  }, [labelsMap]);

  const total = allSigns.length;

  // Signs for the active letter (or search)
  const displayed = useMemo(() => {
    if (search.trim().length > 0) {
      const q = removeAccents(search.trim().toLowerCase());
      return allSigns.filter(s => removeAccents(s.label.toLowerCase()).includes(q));
    }
    if (activeLetter === 'ALL') return allSigns;
    return allSigns.filter(s => firstLetter(s.label) === activeLetter);
  }, [allSigns, activeLetter, search]);

  // Count per letter for the badge
  const countPerLetter = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of allSigns) {
      const l = firstLetter(s.label);
      counts[l] = (counts[l] ?? 0) + 1;
    }
    return counts;
  }, [allSigns]);

  const handleLetter = useCallback((letter: string) => {
    setActiveLetter(letter);
    setSearch('');
  }, []);

  const letterBtnStyle = (letter: string) => ({
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: activeLetter === letter && !search
      ? '1.5px solid #5ba4b0'
      : `1px solid ${border}`,
    background: activeLetter === letter && !search
      ? 'rgba(91,164,176,0.15)'
      : secBg,
    color: activeLetter === letter && !search ? '#5ba4b0' : textSub,
    minWidth: '32px',
    textAlign: 'center' as const,
    opacity: countPerLetter[letter] ? 1 : 0.35,
  });

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden border" style={{ background: cardBg, borderColor: border }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: border, background: secBg }}>
        <h2 className="text-2xl font-bold" style={{ color: textMain }}>
          📚 {t.admin.dictionary}
        </h2>
        {/* Search */}
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.admin.dictionarySearch}
            className="px-4 py-2 rounded-xl text-sm outline-none"
            style={{
              background: dark ? 'rgba(255,255,255,0.08)' : '#f8fafc',
              border: `1px solid ${border}`,
              color: textMain,
              width: '220px',
            }}
          />
        </div>
      </div>

      {/* Alphabet bar */}
      {!search && (
        <div className="px-6 py-3 flex flex-wrap gap-1 border-b" style={{ borderColor: border, background: bg }}>
          <button style={letterBtnStyle('ALL')} onClick={() => handleLetter('ALL')}>
            {t.admin.dictionaryAll}
          </button>
          {ALPHABET.map(l => (
            <button key={l} style={letterBtnStyle(l)} onClick={() => handleLetter(l)}>
              {l}
              {countPerLetter[l] ? (
                <span style={{ fontSize: '10px', marginLeft: '3px', opacity: 0.7 }}>
                  {countPerLetter[l]}
                </span>
              ) : null}
            </button>
          ))}
          <button style={letterBtnStyle('#')} onClick={() => handleLetter('#')}>
            {t.admin.dictionaryNumbers}
          </button>
        </div>
      )}

      {/* Words grid */}
      <div className="p-6">
        {displayed.length === 0 ? (
          <p className="text-center py-8" style={{ color: textSub }}>
            {t.admin.dictionaryNoResult}
          </p>
        ) : (
          <>
            {search && (
              <p className="text-sm mb-4" style={{ color: textSub }}>
                {displayed.length} résultat{displayed.length > 1 ? 's' : ''} pour « {search} »
              </p>
            )}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {displayed.map(({ signId, label }) => (
                <div
                  key={signId}
                  className="px-3 py-2 rounded-xl text-sm font-medium truncate"
                  title={`${label} (${signId})`}
                  style={{
                    background: 'rgba(91,164,176,0.08)',
                    color: '#5ba4b0',
                    border: `1px solid ${border}`,
                    cursor: 'default',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
