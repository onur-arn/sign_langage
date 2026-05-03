'use client';

import { useDarkMode } from '@/contexts/DarkModeContext';

interface Props {
  /** overlay: for pages with GridAnimation background (light glass button) */
  variant?: 'overlay' | 'solid';
}

export function DarkModeToggle({ variant = 'solid' }: Props) {
  const { dark, toggleDark } = useDarkMode();

  const bg = variant === 'overlay'
    ? dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)'
    : dark ? 'rgba(255,255,255,0.08)' : 'rgba(91,164,176,0.08)';

  return (
    <button
      onClick={toggleDark}
      title={dark ? 'Mode clair' : 'Mode sombre'}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        border: '1px solid rgba(91,164,176,0.25)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      {dark ? (
        /* Sun */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f0d060" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        /* Moon */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5ba4b0" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
