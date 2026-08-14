// A slide-in panel built on the native popover API. No client JS: the button's
// `popovertarget` tells the browser what to open, and the browser handles the
// top layer, light-dismiss (click outside / Escape), focus and inert-ing the
// rest of the page. A section hosting this publishes as static HTML.
//
// This is the mobile-nav case. Hand-rolling it means useState plus an outside
// click listener plus a focus trap plus a body-scroll lock — all of which the
// platform already does, and none of which survives a page shipped without JS.

import { cn } from '@/lib/utils';

/**
 * A slide-in panel (mobile navigation, filters, a cart) opened by its own
 * trigger button. Native popover: opens, light-dismisses and traps focus
 * with no JavaScript, so the section stays static.
 */
export interface DrawerProps {
  /**
   * Unique id for this drawer on the page — the trigger references it.
   * kebab-case, e.g. "mobile-nav".
   */
  id: string;
  /** Trigger button label, also its accessible name. 1–3 words. */
  triggerLabel: string;
  /** Heading inside the panel. 1–4 words. */
  title?: string | null;
  /** The navigation links. 2–8 items. */
  links: {
    /** Visible label. 1–3 words. */
    label: string;
    /** Destination. */
    href: string;
  }[];
  /** Optional emphasised action pinned below the links. */
  cta?: {
    /** Button label. 1–3 words, sentence case. */
    label: string;
    /** Destination. */
    href: string;
  } | null;
  /** Which edge the panel slides from. */
  side?: 'left' | 'right';
}

export function Drawer({ id, triggerLabel, title = null, links, cta = null, side = 'right' }: DrawerProps) {
  return (
    <>
      <button
        type="button"
        // The whole mechanism: no onClick, no state. The browser opens the
        // element whose id this names.
        popoverTarget={id}
        aria-label={triggerLabel}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2',
          'text-sm font-medium text-foreground transition-colors hover:bg-accent',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {triggerLabel}
      </button>

      <div
        id={id}
        popover="auto"
        className={cn(
          'h-full w-[min(20rem,100vw)] border-border bg-background p-6 text-foreground',
          // The popover sits in the top layer; these place it against an edge.
          // `open:` styles the element only while it is showing.
          'm-0 max-h-none',
          side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r',
          'backdrop:bg-black/40',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {title ? <p className="text-lg font-medium">{title}</p> : <span />}
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2.5 text-base text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {cta ? (
          <a
            href={cta.href}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {cta.label}
          </a>
        ) : null}
      </div>
    </>
  );
}

export const DrawerShowcase = [
  {
    props: {
      id: 'mobile-nav',
      triggerLabel: 'Menu',
      title: 'Navigate',
      links: [
        { label: 'Work', href: '#work' },
        { label: 'Studio', href: '#studio' },
        { label: 'Journal', href: '#journal' },
        { label: 'Contact', href: '#contact' },
      ],
      cta: { label: 'Start a project', href: '#contact' },
    },
    label: 'Mobile navigation',
  },
  {
    props: {
      id: 'filters',
      triggerLabel: 'Filters',
      links: [
        { label: 'Newest', href: '?sort=new' },
        { label: 'Price', href: '?sort=price' },
      ],
      side: 'left',
    },
    label: 'Filter panel, left',
  },
];
