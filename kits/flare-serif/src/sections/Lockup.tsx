import { Rule } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The page's nameplate bar: a tracked all-caps wordmark given a full cap
 * height of clear space on every side, with navigation set small and wide
 * beside it. The clear space is the point — an inscriptional wordmark needs
 * the air, and crowding it is what makes a flare serif read as a logo
 * squeezed into a header. Place first, above the specimen.
 */
export interface LockupProps extends SectionBaseProps {
  /** Wordmark text. 1–2 words, any casing — the component uppercases it. */
  wordmark: string;
  /** Small line set under the wordmark, e.g. a foundry or studio descriptor. 2–5 words. */
  tagline?: string | null;
  /** Navigation links. 2–5 items. Each label: 1–2 words. */
  links?: {
    /** Visible link text. 1–2 words, Title Case. */
    label: string;
    /**
     * Destination, usually an in-page anchor like "#specimen".
     * @kind url
     */
    href: string;
  }[];
  /** Where the wordmark sits relative to the links. */
  variant?: 'wordmark-left' | 'wordmark-center';
}

export function Lockup({
  id,
  wordmark,
  tagline,
  links = [],
  variant = 'wordmark-left',
}: LockupProps) {
  const centered = variant === 'wordmark-center';
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between',
          centered && 'md:flex-col md:items-center md:gap-4',
        )}
        // Clear space of 1x the wordmark's own cap height on all sides.
        style={{ paddingTop: 'calc(var(--clear-space) * 2.5)', paddingBottom: 'calc(var(--clear-space) * 2)' }}
      >
        <div className={cn(centered && 'text-center')}>
          <p className="caps-lockup font-display text-2xl leading-none font-black text-foreground md:text-3xl">
            {wordmark}
          </p>
          {tagline ? (
            <p className="mt-2 font-sans text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {tagline}
            </p>
          ) : null}
        </div>
        {links.length > 0 ? (
          <nav
            className={cn(
              'flex flex-wrap items-center gap-x-8 gap-y-2',
              centered && 'justify-center',
            )}
          >
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="font-sans text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
      <div className="mx-auto w-full max-w-7xl px-6">
        <Rule weight="flare" />
      </div>
    </section>
  );
}

export const LockupDemo: LockupProps = {
  wordmark: 'Kestrel & Vane',
  tagline: 'Type foundry, est. 2019',
  links: [
    { label: 'Specimen', href: '#specimen' },
    { label: 'Weights', href: '#weights' },
    { label: 'Anatomy', href: '#anatomy' },
    { label: 'License', href: '#enquiry' },
  ],
  variant: 'wordmark-left',
};
