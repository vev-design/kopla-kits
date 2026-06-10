import type { SectionBaseProps } from '@/types';

/**
 * Minimal portfolio footer — a wordmark and a small print line. Keep it
 * quiet; the work has already done the talking.
 */
export interface FooterProps extends SectionBaseProps {
  /** Name / wordmark. 1–3 words. */
  name: string;
  /** Small print, e.g. a copyright or location line. 3–10 words. */
  note?: string | null;
}

export function Footer({ id, name, note }: FooterProps) {
  return (
    <footer
      id={id ?? undefined}
      className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-border px-6 py-10 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="font-display text-sm font-semibold tracking-tight">{name}</span>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
    </footer>
  );
}

export const FooterDemo: FooterProps = {
  name: 'Maya Okafor',
  note: '© 2026 · Designed & built in Lisbon',
};
