import { Reveal } from '@/motion';
import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call to connect — a big line, an email button, and optional
 * social links. Use as the last content section before the footer.
 */
export interface ContactProps extends SectionBaseProps {
  /** Big prompt. 1 sentence, 3–8 words, e.g. "Let’s make something". */
  headline: string;
  /** Supporting line. 1 sentence, 8–20 words. */
  body?: string | null;
  /** Contact email address (rendered as a mailto button). */
  email: string;
  /** Social / external links. 0–5 items. */
  links?: {
    /** Label. 1–2 words, e.g. "Instagram". */
    label: string;
    /**
     * URL.
     * @kind url
     */
    href: string;
  }[];
}

export function Contact({ id, headline, body, email, links }: ContactProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-5xl px-6 py-20 md:py-32">
      <Reveal className="flex flex-col items-start gap-6">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {headline}
        </h2>
        {body ? <p className="max-w-xl text-lg text-muted-foreground text-pretty">{body}</p> : null}
        <Button asChild size="lg" className="mt-2">
          <a href={`mailto:${email}`}>{email}</a>
        </Button>
        {links && links.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </Reveal>
    </section>
  );
}

export const ContactDemo: ContactProps = {
  headline: 'Let’s make something good.',
  body: 'I take on a handful of projects a year. If the fit feels right, I’d love to hear about yours.',
  email: 'hello@mayaokafor.com',
  links: [
    { label: 'Instagram', href: '#' },
    { label: 'Read.cv', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};
