import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Top navigation bar with a heavy black-weight wordmark, in-page anchor
 * links, and a single primary call-to-action button. Always the first
 * section on the page. The wordmark is rendered at the top of Archivo's
 * weight range to state the system's whole premise before anything moves.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Surge"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#work". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#features") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Primary action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Get in motion"). */
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="text-xl tracking-tight"
          style={{ fontVariationSettings: "'wght' 900" }}
        >
          {logo}
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Surge',
  links: [
    { label: 'Work', href: '#work' },
    { label: 'Numbers', href: '#numbers' },
    { label: 'Voices', href: '#voices' },
  ],
  cta: { label: 'Start a drop', href: '#cta' },
};
