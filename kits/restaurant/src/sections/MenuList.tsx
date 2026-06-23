import { Badge } from '@/components/Badge';
import { Divider } from '@/components/Divider';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The menu — the centerpiece of the page. Dishes are grouped into named
 * categories (Starters, Mains, Desserts); each item shows a name, a short
 * description, and a price aligned to the right with a dotted leader. Pick a
 * single elegant column or a two-column spread with `variant`.
 */
export interface MenuListProps extends SectionBaseProps {
  /** Small overline above the heading. 1–3 words, title case (e.g. "The Menu"). */
  overline?: string | null;
  /** Section heading. 1 sentence, 2–6 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 8–20 words. */
  intro?: string | null;
  /** Menu categories. 2–4 items. */
  categories: {
    /** Category name. 1–2 words, title case (e.g. "Starters"). */
    name: string;
    /** Dishes in this category. 2–6 items. */
    items: {
      /** Dish name. 1–4 words, title case. */
      name: string;
      /** Dish description / ingredients. 1 sentence, 4–14 words, no trailing period. */
      description?: string | null;
      /** Price. Number with currency symbol, max 6 characters (e.g. "$32"). */
      price: string;
    }[];
  }[];
  /** Layout: a single centered column or a two-column spread on desktop. */
  variant?: 'single-column' | 'two-column';
}

export function MenuList({
  id,
  overline,
  heading,
  intro,
  categories,
  variant = 'single-column',
}: MenuListProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
        <Reveal className="mb-16 flex flex-col items-center gap-5 text-center">
          {overline ? <Badge variant="gold">{overline}</Badge> : null}
          <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          {intro ? (
            <p className="max-w-xl text-base text-muted-foreground text-pretty">
              {intro}
            </p>
          ) : null}
        </Reveal>
        <Stagger
          className={cn(
            'grid gap-x-16 gap-y-14',
            variant === 'two-column' ? 'md:grid-cols-2' : 'mx-auto max-w-2xl',
          )}
        >
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col gap-7">
              <div className="flex flex-col items-center gap-4">
                <h3 className="font-serif text-2xl font-medium tracking-wide text-primary">
                  {category.name}
                </h3>
                <Divider align="center" className="max-w-[7rem]" />
              </div>
              <ul className="flex flex-col gap-6">
                {category.items.map((item) => (
                  <li key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-lg tracking-wide">
                        {item.name}
                      </span>
                      <span
                        className="mb-1 flex-1 border-b border-dotted border-border"
                        aria-hidden
                      />
                      <span className="font-serif text-lg text-primary">
                        {item.price}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="max-w-md text-sm text-muted-foreground text-pretty">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const MenuListDemo: MenuListProps = {
  overline: 'The Menu',
  heading: 'Tasting & À La Carte',
  intro: 'A short, seasonal menu that changes with the market each week.',
  categories: [
    {
      name: 'Starters',
      items: [
        {
          name: 'Chilled Oysters',
          description: 'Half dozen, shallot mignonette, sea herbs',
          price: '$24',
        },
        {
          name: 'Heirloom Beets',
          description: 'Whipped goat cheese, toasted hazelnut, honey',
          price: '$18',
        },
        {
          name: 'Steak Tartare',
          description: 'Hand-cut beef, cured yolk, grilled sourdough',
          price: '$22',
        },
      ],
    },
    {
      name: 'Mains',
      items: [
        {
          name: 'Roasted Duck Breast',
          description: 'Cherry gastrique, charred endive, farro',
          price: '$42',
        },
        {
          name: 'Line-Caught Halibut',
          description: 'Brown butter, capers, fennel confit',
          price: '$38',
        },
        {
          name: 'Wild Mushroom Risotto',
          description: 'Aged parmesan, black truffle, thyme',
          price: '$32',
        },
      ],
    },
    {
      name: 'Desserts',
      items: [
        {
          name: 'Dark Chocolate Tart',
          description: 'Salted caramel, crème fraîche, cocoa nib',
          price: '$14',
        },
        {
          name: 'Vanilla Panna Cotta',
          description: 'Poached pear, brown sugar, almond',
          price: '$12',
        },
      ],
    },
    {
      name: 'Cellar',
      items: [
        {
          name: 'Coastal Whites',
          description: 'A rotating list of mineral, sea-bright pours',
          price: '$16',
        },
        {
          name: 'Old-World Reds',
          description: 'Earthy, structured bottles for the table',
          price: '$18',
        },
      ],
    },
  ],
  variant: 'two-column',
};
