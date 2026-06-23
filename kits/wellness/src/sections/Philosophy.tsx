import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A warm image-and-text section about the studio's approach. A serene photo
 * sits on one side of a soft headline, a short reflective paragraph, a small
 * set of guiding principles, and an optional link. Use `variant` to place the
 * image on the left or the right. Use after the offerings to share the
 * studio's spirit.
 */
export interface PhilosophyProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Our approach"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 4–9 words, no trailing period. */
  heading: string;
  /** Reflective paragraph about the studio's approach. 2–3 sentences, 36–70 words. */
  body: string;
  /** Guiding principles. 2–4 items. Each: 1 short phrase, max 6 words. */
  principles?: string[] | null;
  /** Optional text link below the copy. Omit to hide. */
  link?: {
    /** Link label. 1–3 words, sentence case (e.g. "Meet the teachers"). */
    label: string;
    /**
     * Destination the link points to.
     * @kind url
     */
    href: string;
  } | null;
  /**
   * Serene image (portrait or square; studio, nature, or people).
   * @kind image
   */
  image: string;
  /** Which side the image sits on. */
  variant?: 'image-left' | 'image-right';
}

export function Philosophy({
  id,
  eyebrow,
  heading,
  body,
  principles,
  link,
  image,
  variant = 'image-right',
}: PhilosophyProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <Reveal
          className={cn(
            'flex flex-col items-start gap-6',
            variant === 'image-left' ? 'md:order-2' : 'md:order-1',
          )}
        >
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
          <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">{body}</p>
          {principles && principles.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="flex items-center gap-3 text-base font-semibold"
                >
                  <span
                    className="size-2 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  {principle}
                </li>
              ))}
            </ul>
          ) : null}
          {link ? (
            <Button asChild variant="link" className="px-0 text-base">
              <a href={link.href}>{link.label}</a>
            </Button>
          ) : null}
        </Reveal>
        <Reveal
          className={cn(variant === 'image-left' ? 'md:order-1' : 'md:order-2')}
        >
          <div className="overflow-hidden rounded-xl">
            <img
              src={image}
              alt=""
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const PhilosophyDemo: PhilosophyProps = {
  eyebrow: 'Our approach',
  heading: 'A practice that meets you gently',
  body: 'We believe wellness is not a performance. There are no mirrors here and nothing to perfect — only an invitation to slow down and listen. Our teachers hold a soft, unhurried space where every body is welcome and every breath is enough.',
  principles: [
    'Move at your own pace',
    'No mirrors, no pressure',
    'Every body is welcome',
  ],
  link: { label: 'Meet the teachers', href: '#' },
  image:
    'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
  variant: 'image-right',
};
