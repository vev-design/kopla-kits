import { Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * The speaker lineup — a grid of headshots with names and roles. The social
 * proof that sells the ticket.
 */
export interface SpeakersProps extends SectionBaseProps {
  /** Section heading. 1–3 words, e.g. "Speakers". */
  heading: string;
  /** Optional supporting line. 1 sentence, 6–18 words. */
  intro?: string | null;
  /** Speakers. 3–12 items. */
  speakers: {
    /** Full name. 2–3 words. */
    name: string;
    /** Role + company. 2–6 words, e.g. "Staff engineer, Vercel". */
    role: string;
    /**
     * Headshot.
     * @kind image
     */
    image: string;
  }[];
}

export function Speakers({ id, heading, intro, speakers }: SpeakersProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <div className="mb-10 flex flex-col gap-3">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
        {intro ? <p className="max-w-xl text-muted-foreground text-pretty">{intro}</p> : null}
      </div>
      <Stagger className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {speakers.map((s, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary">
              <img src={s.image} alt={s.name} className="size-full object-cover" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold leading-tight">{s.name}</span>
              <span className="text-sm text-muted-foreground">{s.role}</span>
            </div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

export const SpeakersDemo: SpeakersProps = {
  heading: 'Speakers',
  intro: 'The people shaping how we build — sharing what actually worked.',
  speakers: [
    {
      name: 'Lena Park',
      role: 'Principal engineer, Stripe',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    },
    {
      name: 'Diego Ramos',
      role: 'Design lead, Figma',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    },
    {
      name: 'Amara Osei',
      role: 'CTO, Northwind',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    },
    {
      name: 'Sam Whitfield',
      role: 'Staff engineer, Vercel',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    },
  ],
};
