import { Reveal } from '@/motion';
import { MediaBlock, type ImageBlockProps, type VideoBlockProps } from '@/components/blocks';
import { Eyebrow } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The face off the specimen sheet and onto something real — a packaging shot,
 * a storefront, a bottle, a poster — with a tracked caps lockup set over it.
 * A display serif is an argument about a category, so this section is where
 * the argument gets tested: the media slot takes a photograph or a short clip,
 * and the overlay proves the lockup survives being placed on top of an image.
 *
 * @hydrate
 */
export interface InUseProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** The lockup set over the media. 1–3 words, no punctuation — it is uppercased and tracked. */
  lockup: string;
  /** Line under the lockup. 1 sentence, 4–10 words, no trailing period. */
  caption?: string | null;
  /** The photograph or clip the type sits on. */
  media: ImageBlockProps | VideoBlockProps;
  /** How the media and the lockup relate. */
  variant?: 'overlay' | 'stacked';
}

export function InUse({
  id,
  eyebrow,
  lockup,
  caption,
  media,
  variant = 'overlay',
}: InUseProps) {
  const overlaid = variant === 'overlay';
  return (
    <section id={id ?? undefined} className="w-full bg-background py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        {eyebrow ? <Eyebrow className="mb-8">{eyebrow}</Eyebrow> : null}
        <Reveal className="relative">
          <div
            className={cn(
              'relative w-full overflow-hidden bg-muted',
              overlaid ? 'aspect-[16/10] md:aspect-[21/9]' : 'aspect-[16/9]',
            )}
          >
            <MediaBlock media={media} />
            {overlaid ? (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-foreground/45"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <p className="caps-lockup font-display text-[clamp(2rem,9vw,7rem)] leading-none font-black text-background">
                    {lockup}
                  </p>
                  {caption ? (
                    <p className="mt-6 font-sans text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-background/80">
                      {caption}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
          {!overlaid ? (
            <div className="mt-10">
              <p className="caps-lockup font-display text-[clamp(2rem,7vw,5rem)] leading-none font-black text-foreground">
                {lockup}
              </p>
              {caption ? (
                <p className="mt-5 font-sans text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
                  {caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export const InUseDemo: InUseProps = {
  eyebrow: 'In use',
  lockup: 'Foundry Row',
  caption: 'Brewery identity, Portland',
  media: {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=2000&q=80',
    alt: 'Bottles on a steel counter in a brewery taproom at dusk',
  },
  variant: 'overlay',
};
