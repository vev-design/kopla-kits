import { Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A grid of selected work — each item a cover image with a title and
 * category. The backbone of the portfolio; reveals on scroll.
 */
export interface WorkGridProps extends SectionBaseProps {
  /** Section label. 1–4 words, e.g. "Selected work". */
  heading?: string | null;
  /** Projects. 3–9 items. */
  items: {
    /** Project title. 1–4 words. */
    title: string;
    /** Discipline / category. 1–3 words, e.g. "Branding". */
    category: string;
    /**
     * Cover image.
     * @kind image
     */
    image: string;
    /**
     * Link to the case study or live work.
     * @kind url
     */
    href?: string | null;
  }[];
  /** Grid density. */
  columns?: 'two' | 'three';
}

export function WorkGrid({ id, heading, items, columns = 'two' }: WorkGridProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
      {heading ? (
        <h2 className="mb-8 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {heading}
        </h2>
      ) : null}
      <Stagger
        className={cn(
          'grid grid-cols-1 gap-x-6 gap-y-10',
          columns === 'three' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        )}
      >
        {items.map((item, i) => (
          <a key={i} href={item.href ?? undefined} className="group block">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
              <img
                src={item.image}
                alt={item.title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="font-display text-lg font-medium tracking-tight">{item.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.category}</span>
            </div>
          </a>
        ))}
      </Stagger>
    </section>
  );
}

export const WorkGridDemo: WorkGridProps = {
  heading: 'Selected work',
  columns: 'two',
  items: [
    {
      title: 'Northwind',
      category: 'Brand & web',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
    },
    {
      title: 'Cadence',
      category: 'Product design',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&q=80',
    },
    {
      title: 'Field Notes',
      category: 'Editorial',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
    },
    {
      title: 'Atlas',
      category: 'Identity',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&q=80',
    },
  ],
};
