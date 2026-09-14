import { MediaBlock, type ImageBlockProps, type VideoBlockProps } from '@/components/blocks';
import { Badge, Button, Nav } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed opening statement for a business-finance page, pairing an oversized
 * promise with a photographic or video moment and direct acquisition actions.
 */
export interface HeroProps extends SectionBaseProps {
  /** Wordmark shown in the navigation. 1 word. */
  brand?: string;
  /** Main navigation links. 3–6 concise labels with in-page URLs. */
  navigation: { label: string; /** @kind url */ href: string }[];
  /** Top-bar acquisition action. */
  navigationAction?: { label: string; /** @kind url */ href: string } | null;
  /** Small proof or category label. 1–3 words. */
  eyebrow?: string | null;
  /** Primary statement. 2–3 short lines, 6–14 words, no trailing period. */
  headline: string;
  /** Supporting context. 1–2 sentences, 16–34 words. */
  body?: string | null;
  /** Primary conversion action. */
  primaryAction: { label: string; /** @kind url */ href: string };
  /** Secondary exploration action. */
  secondaryAction?: { label: string; /** @kind url */ href: string } | null;
  /** Hero visual, presented as a full-bleed media frame. */
  media: ImageBlockProps | VideoBlockProps;
  /** Small bottom-right context line. 5–12 words. */
  caption?: string | null;
}

export function Hero({ id, brand = 'Qonto', navigation, navigationAction, eyebrow, headline, body, primaryAction, secondaryAction, media, caption }: HeroProps) {
  return <section id={id ?? undefined} className="relative isolate min-h-screen overflow-clip bg-[var(--dark)] text-primary-foreground">
    <div className="absolute inset-0 -z-10"><MediaBlock media={media} /></div>
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(from_#050505_l_c_h_/_88%),oklch(from_#050505_l_c_h_/_28%)_70%,oklch(from_#050505_l_c_h_/_42%))]" />
    <Nav brand={brand} links={navigation} action={navigationAction} variant="dark" className="relative z-10 bg-transparent" />
    <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-8 lg:px-12 lg:pb-16">
      <div className="max-w-7xl">
        {eyebrow ? <Badge label={eyebrow} variant="subtle" className="mb-5 bg-primary-foreground/15 text-primary-foreground" /> : null}
        <h1 className="max-w-7xl text-balance text-[clamp(3.1875rem,calc(8.4vw-5px),8.1875rem)] font-semibold leading-[.91] tracking-[-0.02em]">{headline}</h1>
        {body ? <p className="mt-7 max-w-xl text-lg leading-7 text-primary-foreground/75 sm:text-xl">{body}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3"><Button {...primaryAction} variant="light" size="lg" />{secondaryAction ? <Button {...secondaryAction} variant="outline" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10" /> : null}</div>
      </div>
      {caption ? <p className="mt-16 self-end text-sm text-primary-foreground/60">{caption}</p> : null}
    </div>
  </section>;
}

export const HeroDemo: HeroProps = {
  id: 'top', brand: 'Qonto', navigation: [{ label: 'Business account', href: '#account' }, { label: 'Financial tools', href: '#tools' }, { label: 'Company creation', href: '#company' }, { label: 'Pricing', href: '#pricing' }], navigationAction: { label: 'Open an account', href: '#start' }, eyebrow: '4.7 / 5 Trustpilot', headline: 'Business account. Finance manager. Company creation.', body: 'The business finance platform that makes every working day flow with less friction.', primaryAction: { label: 'Open an account', href: '#start' }, secondaryAction: { label: 'Find the right plan', href: '#account' }, media: { kind: 'image', src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=85', alt: 'A phone being used for a payment at a café table' }, caption: 'Built for ambitious businesses, wherever work happens'
};
