import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top navigation with a serif wordmark, in-page anchor links, and a
 * "Reserve" call-to-action. Always the first section on the page; the links
 * jump to other sections' anchor ids via `#<id>` hrefs. Translucent over the
 * dark canvas so the hero reads through it.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Restaurant wordmark at the left. Plain text, 1–2 words, no tagline (e.g. "Maison Laurent"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#menu". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#menu") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Reserve action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 1–2 words, sentence case (e.g. "Reserve"). */
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
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <a
          href="#top"
          className="font-serif text-xl font-semibold tracking-wide"
        >
          {logo}
        </a>
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Maison Laurent',
  links: [
    { label: 'Menu', href: '#menu' },
    { label: 'Story', href: '#story' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Visit', href: '#hours' },
  ],
  cta: { label: 'Reserve', href: '#reserve' },
};
