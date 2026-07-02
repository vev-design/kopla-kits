import { ArrowUpRight } from 'lucide-react';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Selected-work grid of case studies. Each tile pairs a cover image with a
 * client, project title, and category, and links to the full case. Hover
 * reveals an accent treatment. Use as the studio's portfolio proof; pick the
 * column count with `variant`.
 */
export interface WorkGridProps extends SectionBaseProps {
  /** Section index marker in the header — monospace beside the eyebrow, closed by a hairline rule. Zero-padded two digits in page order (e.g. "02"); omit to hide. */
  index?: string | null;
  /** Monospace label above the heading. 1–3 words, sentence case, no punctuation (e.g. "Selected work"). */
  eyebrow?: string | null;
  /** Section heading. 1 phrase, 2–6 words, no trailing period. */
  heading: string;
  /** Case-study tiles. 2–6 items (multiples of the column count read best). */
  projects: {
    /** Client / brand name. Plain text, 1–3 words. */
    client: string;
    /** Project title. 1 phrase, 2–6 words, no trailing period. */
    title: string;
    /** Discipline tag. 1–2 words, sentence case (e.g. "Brand identity"). */
    category: string;
    /**
     * Cover image. Landscape aspect (≈4:3).
     * @kind image
     */
    image: string;
    /**
     * Link to the full case study.
     * @kind url
     */
    href: string;
  }[];
  /** Number of columns on desktop. */
  variant?: 'two-col' | 'three-col';
}

export function WorkGrid({
  id,
  index,
  eyebrow,
  heading,
  projects,
  variant = 'two-col',
}: WorkGridProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28">
        <Reveal className="mb-14 flex flex-col gap-4 border-b border-border pb-6">
          {index || eyebrow ? (
            <div className="flex items-center gap-4">
              {index ? (
                <span className="font-mono text-sm font-medium text-primary">{index}</span>
              ) : null}
              {eyebrow ? (
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
          ) : null}
          <div className="flex items-end justify-between gap-6">
            <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.02em] text-balance uppercase md:text-6xl">
              {heading}
            </h2>
            <span className="hidden font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:inline">
              {String(projects.length).padStart(2, '0')} projects
            </span>
          </div>
        </Reveal>
        <Stagger
          className={cn(
            'grid gap-x-8 gap-y-12',
            variant === 'three-col' ? 'md:grid-cols-3' : 'md:grid-cols-2',
          )}
        >
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.href}
              className="group flex flex-col gap-5"
            >
              <div className="relative overflow-hidden rounded-sm border border-border">
                <img
                  src={project.image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <span className="absolute inset-0 bg-primary opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {project.client} — {project.category}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                    {project.title}
                  </h3>
                </div>
                <ArrowUpRight className="mt-1 size-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const WorkGridDemo: WorkGridProps = {
  index: '02',
  eyebrow: 'Selected work',
  heading: 'Recent projects',
  projects: [
    {
      client: 'Lumen',
      title: 'A grid that breathes',
      category: 'Brand identity',
      image:
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80',
      href: '#',
    },
    {
      client: 'Vantage',
      title: 'Type as the product',
      category: 'Web design',
      image:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
      href: '#',
    },
    {
      client: 'Halo Records',
      title: 'Sound made visible',
      category: 'Motion',
      image:
        'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80',
      href: '#',
    },
    {
      client: 'Northbound',
      title: 'A loud rebrand',
      category: 'Strategy',
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      href: '#',
    },
  ],
  variant: 'two-col',
};
