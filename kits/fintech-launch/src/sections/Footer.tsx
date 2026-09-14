import { Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A compact dark footer that closes the presentation with practical navigation and a final low-pressure action. */
export interface FooterProps extends SectionBaseProps {
  /** Non-linked wordmark. 1 word. */ brand?: string;
  /** Footer navigation. 3–8 short labels with URLs. */ links: { label: string; /** @kind url */ href: string }[];
  /** Small legal or location line. 6–18 words. */ legal: string;
  /** Optional final action. */ action?: { label: string; /** @kind url */ href: string } | null;
}
export function Footer({ id, brand = 'Qonto', links, legal, action }: FooterProps) { return <footer id={id ?? undefined} className="bg-[var(--dark-surface)] px-5 py-10 text-primary-foreground sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between"><div><p className="text-3xl font-semibold tracking-[-.01em]">{brand}</p><p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/55">{legal}</p></div><div className="flex flex-wrap gap-x-6 gap-y-3">{links.map((link) => <a key={link.href} href={link.href} className="qonto-underlined text-sm text-primary-foreground/75 hover:text-primary-foreground">{link.label}</a>)}</div>{action ? <Button {...action} variant="outline" className="self-start border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10" /> : null}</div></footer>; }
export const FooterDemo: FooterProps = { id: 'footer', brand: 'Qonto', links: [{ label: 'Business account', href: '#account' }, { label: 'Financial tools', href: '#tools' }, { label: 'Company creation', href: '#company' }, { label: 'Pricing', href: '#top' }], legal: 'Qonto is a French company headquartered in Paris.', action: { label: 'Open an account', href: '#start' } };
