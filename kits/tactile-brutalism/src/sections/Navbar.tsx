import { Button } from '@/components/Button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top bar: a mono uppercase wordmark, a row of uppercase nav links,
 * and a single outline CTA — separated from the page by one hard border,
 * no blur, no shadow. Always the first section on the page; links jump to
 * other sections' anchor ids via `#<id>` hrefs.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Monolith"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#work". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#work") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Primary action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Get in touch"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
}

export function Navbar({ id, logo, links, cta }: NavbarProps) {
  return (
    <section
      id={id ?? undefined}
      className="sticky top-0 z-50 w-full border-b border-border bg-background"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <a
          href="#top"
          className="font-mono text-base font-semibold tracking-[0.08em] text-foreground uppercase"
        >
          {logo}
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm" variant="outline">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Monolith',
  links: [
    { label: 'Work', href: '#work' },
    { label: 'Studio', href: '#stat' },
    { label: 'Reviews', href: '#testimonial' },
  ],
  cta: { label: 'Get in touch', href: '#cta' },
};
