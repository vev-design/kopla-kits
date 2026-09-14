import { MediaBlock, type ImageBlockProps, type VideoBlockProps } from '@/components/blocks';
import { Badge, Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A cinematic customer-proof section that lets one founder story occupy an entire dark visual chapter. */
export interface CustomerStoryProps extends SectionBaseProps {
  /** Small proof label. 1–3 words. */ eyebrow?: string | null;
  /** Main customer statement. 1–2 sentences, 18–42 words. */ quote: string;
  /** Attribution line. Name, role, and company; 4–12 words. */ attribution: string;
  /** Portrait or customer-story media displayed full frame. */ media: ImageBlockProps | VideoBlockProps;
  /** Optional customer-story action. */ action?: { label: string; /** @kind url */ href: string } | null;
}
export function CustomerStory({ id, eyebrow, quote, attribution, media, action }: CustomerStoryProps) { return <section id={id ?? undefined} className="bg-[var(--dark)] px-5 py-24 text-primary-foreground sm:px-8 lg:px-12 lg:py-32"><div className="mx-auto max-w-7xl"><h2 className="text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[.93] tracking-[-0.02em]">Our customers say it best</h2><div className="relative mt-14 grid min-h-[34rem] overflow-clip rounded-xl bg-[var(--dark-surface)] lg:grid-cols-2"><div className="absolute inset-0 lg:relative"><MediaBlock media={media} /></div><div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(from_#050505_l_c_h_/_86%),oklch(from_#050505_l_c_h_/_10%))] lg:hidden" /><div className="relative z-10 flex flex-col justify-end p-7 sm:p-12 lg:justify-center"><div>{eyebrow ? <Badge label={eyebrow} variant="subtle" className="bg-primary-foreground/10 text-primary-foreground" /> : null}<blockquote className="mt-6 text-[clamp(1.8rem,3vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.01em]">“{quote}”</blockquote><p className="mt-6 text-base text-primary-foreground/65">{attribution}</p>{action ? <Button {...action} variant="outline" className="mt-8 self-start text-primary-foreground hover:bg-primary-foreground/10" /> : null}</div></div></div></div></section>; }
export const CustomerStoryDemo: CustomerStoryProps = { id: 'stories', eyebrow: 'Customer story', quote: 'Qonto adapts as our team grows. It removes low-value processes and makes expense management simple.', attribution: 'Oksana Besnier, Finance Manager at Poiscaille', media: { kind: 'image', src: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85', alt: 'A business owner smiling in a modern office' }, action: { label: 'Discover customer stories', href: '#start' } };
