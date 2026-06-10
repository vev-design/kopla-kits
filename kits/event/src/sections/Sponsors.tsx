import type { SectionBaseProps } from '@/types';

/**
 * A row of sponsor / partner wordmarks under a small label. Text wordmarks
 * (not logo images) so the section stays light and on-brand.
 */
export interface SponsorsProps extends SectionBaseProps {
  /** Small label. 1–4 words, e.g. "Backed by". */
  label?: string | null;
  /** Sponsor names. 3–10 items, 1–2 words each. */
  names: string[];
}

export function Sponsors({ id, label, names }: SponsorsProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-5xl px-6 py-14">
      {label ? (
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {names.map((name, i) => (
          <span key={i} className="text-lg font-semibold tracking-tight text-foreground/40">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

export const SponsorsDemo: SponsorsProps = {
  label: 'Backed by',
  names: ['Vercel', 'Stripe', 'Figma', 'Linear', 'Supabase', 'Raycast'],
};
