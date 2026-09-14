import { MediaBlock, type ImageBlockProps, type VideoBlockProps } from '@/components/blocks';
import { Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A light, image-led company-creation chapter that turns a practical service into a confident moment of momentum. */
export interface CompanyCreationProps extends SectionBaseProps {
  /** Primary statement. 4–9 words, no trailing period. */ headline: string;
  /** Three short assurances. Exactly 3 items, each with a 2–5 word title and a sentence. */ benefits: { title: string; body: string }[];
  /** Wide service visual displayed as a media frame. */ media: ImageBlockProps | VideoBlockProps;
  /** Primary company-creation action. */ action: { label: string; /** @kind url */ href: string };
}
export function CompanyCreation({ id, headline, benefits, media, action }: CompanyCreationProps) { return <section id={id ?? undefined} className="bg-background px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="mx-auto max-w-7xl"><h2 className="text-center text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[.93] tracking-[-0.02em]">{headline}</h2><div className="mt-14 grid gap-10 text-center md:grid-cols-3">{benefits.map((benefit, index) => <div key={benefit.title}><span className="inline-grid size-11 place-items-center rounded-lg bg-card text-sm font-semibold">0{index + 1}</span><h3 className="mt-4 text-xl font-semibold tracking-[-0.01em]">{benefit.title}</h3><p className="mx-auto mt-3 max-w-sm leading-6 text-muted-foreground">{benefit.body}</p></div>)}</div><div className="relative mt-16 aspect-[16/7] overflow-clip rounded-xl bg-card"><MediaBlock media={media} /><div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(from_#050505_l_c_h_/_35%),transparent_65%)]" /></div><div className="mt-10 text-center"><Button {...action} variant="outline" /></div></div></section>; }
export const CompanyCreationDemo: CompanyCreationProps = { id: 'company', headline: 'Create your company with Qonto', benefits: [{ title: 'Simple and fast', body: 'Ditch the paperwork. Be up and running in 24 hours.' }, { title: 'The right fit', body: 'Built for the business structure you are creating.' }, { title: 'With you all the way', body: 'From start to registration, get support every day.' }], media: { kind: 'image', src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85', alt: 'A founder working at a desk with a laptop' }, action: { label: 'Create your company', href: '#start' } };
