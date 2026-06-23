import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Soft, rounded top navigation for the studio. A serif wordmark on the left,
 * a row of in-page anchor links, and a gently rounded "Book a class" button on
 * the right. Always the first section on the page; links jump to other
 * sections' anchor ids via `#<id>` hrefs.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Studio wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Lumen Studio"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#schedule". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#offerings") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Primary action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a class"). */
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
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <a
          href="#top"
          className="font-serif text-xl font-semibold tracking-tight"
        >
          {logo}
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm" className="rounded-full px-5">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Lumen Studio',
  links: [
    { label: 'Classes', href: '#offerings' },
    { label: 'Approach', href: '#philosophy' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Membership', href: '#membership' },
  ],
  cta: { label: 'Book a class', href: '#cta' },
};
