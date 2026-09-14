import { Badge } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/** A sparse black proof band for communicating scale, human support, and independent customer trust. */
export interface ProofRowProps extends SectionBaseProps {
  /** Optional compact trust marker. 1–3 words. */ eyebrow?: string | null;
  /** Proof points. Exactly 3 items, each with a short figure and one supporting sentence. */ items: { figure: string; description: string }[];
}
export function ProofRow({ id, eyebrow, items }: ProofRowProps) { return <section id={id ?? undefined} className="bg-[var(--dark)] px-5 py-20 text-primary-foreground sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-7xl">{eyebrow ? <div className="text-center"><Badge label={eyebrow} variant="subtle" className="bg-primary-foreground/10 text-primary-foreground" /></div> : null}<div className="mt-9 grid gap-12 text-center md:grid-cols-3">{items.map((item) => <Reveal key={item.figure}><div><p className="text-3xl font-semibold tracking-[-0.01em]">{item.figure}</p><p className="mx-auto mt-3 max-w-xs text-base leading-6 text-primary-foreground/60">{item.description}</p></div></Reveal>)}</div></div></section>; }
export const ProofRowDemo: ProofRowProps = { id: 'proof', eyebrow: 'Trusted every day', items: [{ figure: '600,000+ clients', description: 'Use Qonto daily to run their businesses.' }, { figure: '4.7 / 5', description: 'Rated independently by our customers.' }, { figure: '24/7 human support', description: 'Available via chat, email, and phone.' }] };
