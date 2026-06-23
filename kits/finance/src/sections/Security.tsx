import {
  Eye,
  Fingerprint,
  Landmark,
  Lock,
  ScrollText,
  ShieldCheck,
  UmbrellaIcon,
  Vault,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  lock: Lock,
  vault: Vault,
  fingerprint: Fingerprint,
  landmark: Landmark,
  umbrella: UmbrellaIcon,
  document: ScrollText,
  eye: Eye,
};

/**
 * Sober trust-and-compliance section. A calm heading and a grid of reassurance
 * cards — encryption, regulation, insurance, monitoring. Reads as steady and
 * credible, not flashy. Place after the performance band, before pricing.
 */
export interface SecurityProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Security"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Trust cards. 3–6 items. */
  items: {
    /** Icon name. One of: shield, lock, vault, fingerprint, landmark, umbrella, document, eye. */
    icon:
      | 'shield'
      | 'lock'
      | 'vault'
      | 'fingerprint'
      | 'landmark'
      | 'umbrella'
      | 'document'
      | 'eye';
    /** Trust point title. 1–3 words, sentence case. */
    title: string;
    /** Trust point body. 1–2 sentences, 12–28 words. Reassuring, plain language. */
    body: string;
  }[];
}

export function Security({ id, eyebrow, heading, subhead, items }: SecurityProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex max-w-2xl flex-col gap-4">
          {eyebrow ? (
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck;
            return (
              <Card key={item.title} variant="feature" className="bg-secondary/40">
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  {item.body}
                </p>
              </Card>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export const SecurityDemo: SecurityProps = {
  eyebrow: 'Security',
  heading: 'Your money, guarded end to end',
  subhead:
    'We hold ourselves to the standards of a regulated institution, so the safety of your funds and data is never in question.',
  items: [
    {
      icon: 'lock',
      title: 'Bank-grade encryption',
      body: 'Every connection and stored record is protected with AES-256 encryption and TLS in transit, audited continuously.',
    },
    {
      icon: 'landmark',
      title: 'Regulated & licensed',
      body: 'Meridian is a registered investment adviser and broker-dealer, examined regularly by independent regulators.',
    },
    {
      icon: 'umbrella',
      title: 'Protected balances',
      body: 'Eligible cash and securities are covered up to statutory limits by deposit and investor-protection insurance.',
    },
    {
      icon: 'fingerprint',
      title: 'Strong authentication',
      body: 'Biometric login and two-factor authentication keep your account reachable only by you.',
    },
    {
      icon: 'eye',
      title: 'Always-on monitoring',
      body: 'Automated systems watch for unusual activity around the clock and flag anything out of pattern in real time.',
    },
    {
      icon: 'document',
      title: 'Independent audits',
      body: 'Our controls are reviewed against SOC 2 standards by third-party auditors and published transparently.',
    },
  ],
};
