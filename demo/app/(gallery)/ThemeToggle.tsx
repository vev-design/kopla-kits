'use client';

// Theme cycle: system → light → dark → system. "system" follows the OS via
// prefers-color-scheme (no data-theme attribute); the explicit modes pin it
// and persist to localStorage. The inline script in layout.tsx replays the
// stored choice before paint, so this only manages changes after mount.
import { useEffect, useState } from 'react';

type Mode = 'system' | 'light' | 'dark';
const ORDER: Mode[] = ['system', 'light', 'dark'];

function apply(mode: Mode) {
  const el = document.documentElement;
  if (mode === 'system') {
    el.removeAttribute('data-theme');
    try {
      localStorage.removeItem('kopla-theme');
    } catch {}
  } else {
    el.setAttribute('data-theme', mode);
    try {
      localStorage.setItem('kopla-theme', mode);
    } catch {}
  }
}

function read(): Mode {
  if (typeof document === 'undefined') return 'system';
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' || t === 'dark' ? t : 'system';
}

const ICON: Record<Mode, JSX.Element> = {
  system: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const LABEL: Record<Mode, string> = { system: 'System', light: 'Light', dark: 'Dark' };

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(read());
    setMounted(true);
  }, []);

  function next() {
    const m = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    apply(m);
    setMode(m);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={next}
      // Avoid a hydration mismatch flash: the label only matters once mounted.
      aria-label={`Theme: ${LABEL[mode]}. Click to change.`}
      title={`Theme: ${LABEL[mode]}`}
      suppressHydrationWarning
    >
      <span className="theme-toggle__icon">{ICON[mode]}</span>
      <span className="theme-toggle__label">{mounted ? LABEL[mode] : 'System'}</span>
    </button>
  );
}
