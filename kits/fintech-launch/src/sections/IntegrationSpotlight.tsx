import { Badge, Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A large integration statement for showing how the account connects to the tools already used across a business. */
export interface IntegrationSpotlightProps extends SectionBaseProps {
  /** Small category label. 1–3 words. */ eyebrow?: string | null;
  /** Primary statement. 4–10 words, no trailing period. */ headline: string;
  /** Supporting paragraph. 1–2 sentences, 18–34 words. */ body: string;
  /** Action leading to an integrations directory. */ action: { label: string; /** @kind url */ href: string };
  /** Brand marks arranged around the central account mark. 4–8 short labels. */ integrations: string[];
}
export function IntegrationSpotlight({ id, eyebrow, headline, body, action, integrations }: IntegrationSpotlightProps) { return <section id={id ?? undefined} className="bg-background px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="mx-auto grid max-w-7xl items-center gap-12 rounded-xl bg-card p-7 lg:grid-cols-2 lg:p-16"><div>{eyebrow ? <Badge label={eyebrow} variant="dark" /> : null}<h2 className="mt-5 text-[clamp(2.7rem,5vw,5.8rem)] font-semibold leading-[.94] tracking-[-0.02em]">{headline}</h2><p className="mt-6 max-w-xl text-lg leading-7 text-muted-foreground">{body}</p><Button {...action} variant="outline" className="mt-8" /></div><div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center"><div aria-hidden className="pointer-events-none absolute inset-[13%] rounded-full border border-primary/10" /><div className="relative grid size-40 place-items-center rounded-full bg-primary text-3xl font-semibold tracking-[-0.01em] text-primary-foreground">Qonto</div>{integrations.map((name, index) => <span key={name} className="absolute grid size-16 place-items-center rounded-lg bg-background text-center text-[10px] font-semibold shadow-sm" style={{ transform: `rotate(${index * (360 / integrations.length)}deg) translateY(-12rem) rotate(${-index * (360 / integrations.length)}deg)` }}>{name}</span>)}</div></div></section>; }
export const IntegrationSpotlightDemo: IntegrationSpotlightProps = { id: 'integrations', eyebrow: 'Connected finance', headline: 'Keep all your tools connected', body: 'Connect the external tools and accounts your business already relies on, then let your data sync automatically.', action: { label: 'Explore integrations', href: '#company' }, integrations: ['Drive', 'Slack', 'Xero', 'HubSpot', 'Stripe', 'WhatsApp'] };
