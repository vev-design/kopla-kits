import { Reveal } from '@/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A single featured project — a large image beside a short write-up with
 * meta (year, role) and a link. Use to spotlight one piece in depth;
 * alternate the `variant` when stacking several.
 */
export interface ProjectFeatureProps extends SectionBaseProps {
  /** Project title. 1–4 words. */
  title: string;
  /** What it was / the brief. 2–4 sentences, 30–70 words. */
  summary: string;
  /**
   * Project image.
   * @kind image
   */
  image: string;
  /** Year or timeframe. ~4 characters, e.g. "2025". */
  year?: string | null;
  /** Your role. 1–3 words, e.g. "Lead designer". */
  role?: string | null;
  /** Optional link. */
  link?: {
    /** Label. 1–3 words, e.g. "View case study". */
    label: string;
    /**
     * Destination.
     * @kind url
     */
    href: string;
  } | null;
  /** Image side. */
  variant?: 'image-left' | 'image-right';
}

export function ProjectFeature({
  id,
  title,
  summary,
  image,
  year,
  role,
  link,
  variant = 'image-right',
}: ProjectFeatureProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20">
      <Reveal
        className={cn(
          'grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12',
          variant === 'image-left' && 'md:[&>*:first-child]:order-last',
        )}
      >
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground text-pretty">{summary}</p>
          {(year || role) && (
            <dl className="flex gap-8 text-sm">
              {year ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Year</dt>
                  <dd className="font-medium">{year}</dd>
                </div>
              ) : null}
              {role ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Role</dt>
                  <dd className="font-medium">{role}</dd>
                </div>
              ) : null}
            </dl>
          )}
          {link ? (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <a href={link.href}>{link.label}</a>
            </Button>
          ) : null}
        </div>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary">
          <img src={image} alt={title} className="size-full object-cover" />
        </div>
      </Reveal>
    </section>
  );
}

export const ProjectFeatureDemo: ProjectFeatureProps[] = [
  {
    title: 'Cadence',
    summary:
      'A scheduling app for distributed teams. I led the redesign from research through a shipped design system, simplifying the core week view and cutting setup to under a minute.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
    year: '2025',
    role: 'Lead designer',
    link: { label: 'View case study', href: '#' },
    variant: 'image-right',
  },
  {
    title: 'Northwind',
    summary:
      'Brand and marketing site for a logistics startup. Built a flexible visual language and a component kit the team still ships with today.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    year: '2024',
    role: 'Brand & web',
    link: { label: 'View case study', href: '#' },
    variant: 'image-left',
  },
];
