// A slide-in edge panel on the native `popover` attribute — the mobile-nav
// case. No client JS: the trigger's `popovertarget` tells the browser what to
// open, and the browser provides the top layer, the backdrop, light dismiss
// (click outside / Escape) and focus return to the trigger. A section hosting
// this publishes as static HTML.
//
// Hand-rolling this is the classic way a nav goes wrong: `useState` plus an
// outside-click listener plus a body-scroll lock, none of which survives a
// page shipped without JS. Adopted from PR #27 (@bnhovde) and brought up to
// the current catalog contract.
//
// What popover does NOT do, stated plainly (the same honesty as Modal): it
// does not trap focus and it does not inert the page — tabbing past the last
// link continues into the page behind. For a navigation drawer that is
// acceptable: every destination inside is a link that leaves the page anyway.
// A drawer that hosts a FORM someone must complete wants `<dialog>` and a
// script, which is a different component and an `@hydrate` section.

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One link in the drawer. */
export interface DrawerLink {
  /** Visible label. 1–3 words. */
  label: string;
  /** Destination. */
  href: string;
}

/**
 * A slide-in panel (mobile navigation, filters) opened by its own trigger
 * button, built on the `popover` attribute: top layer, backdrop, light
 * dismiss, Escape and focus return, with no JavaScript and nothing to
 * hydrate.
 *
 * Pass the panel's contents as `children` to keep the design's own markup;
 * `links` + `cta` are the data fallback the showcase previews.
 */
export interface DrawerProps {
  /** The trigger button's label. 1–3 words. */
  triggerLabel: string;
  /** Heading inside the panel, and its accessible name. 1–4 words. */
  title?: string | null;
  /** The navigation links, when the panel is not given its own markup. 2–8
   *  entries. */
  links?: DrawerLink[];
  /** Emphasised action pinned below the links. */
  cta?: DrawerLink | null;
  /** The panel's contents. Replaces `links` and `cta`. */
  children?: ReactNode;
  /** Which edge the panel slides from. */
  side?: 'left' | 'right';
  /** The close control's label, for a screen reader. Default `Close`. */
  closeLabel?: string;
  /** Classes for the trigger. */
  className?: string;
  /** Classes for the panel. */
  panelClassName?: string;
  /** Id root, and what `popovertarget` points at. Pass one when two drawers
   *  with the same trigger label could share a page. */
  id?: string;
}

/**
 * A stable id derived from the component's own content.
 *
 * Not `useId`: this component is static — no `@hydrate`, no client JS — and a
 * hook would make it a client component for the sake of a string. The id has
 * to be unique on the page because `popovertarget` resolves it.
 */
function contentId(parts: string[]): string {
  let hash = 0;
  for (const char of parts.join(' ')) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function Drawer({
  triggerLabel,
  title = null,
  links,
  cta = null,
  children,
  side = 'right',
  closeLabel = 'Close',
  className,
  panelClassName,
  id,
}: DrawerProps) {
  const rootId = id ?? `drawer-${contentId([triggerLabel, title ?? ''])}`;
  const panelId = `${rootId}-panel`;
  const titleId = `${rootId}-title`;

  return (
    <>
      <button
        type="button"
        // The whole opening mechanism: no onClick, no state. The browser opens
        // the element whose id this names, and wires the expanded state itself.
        popoverTarget={panelId}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {/* Inline SVG, not lucide — every lucide icon is a 'use client'
            component, and this file's whole point is shipping no runtime. */}
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-5">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {triggerLabel}
      </button>

      <div
        id={panelId}
        // `auto` brings light dismiss and Escape, and closes any other open
        // popover — the behaviour a reader expects from a nav panel.
        popover="auto"
        data-slot="drawer"
        role="dialog"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : triggerLabel}
        className={cn(
          // The popover sits in the top layer with UA `inset: 0`; zeroed margins
          // plus one `auto` side pin it to an edge, full height. `h-dvh` rather
          // than h-full: the panel must reach the real bottom on mobile UI chrome.
          'm-0 h-dvh max-h-none w-[min(20rem,90vw)] border-border bg-background p-6 text-foreground',
          side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r',
          'backdrop:bg-foreground/40',
          // The slide-in, entry only: @starting-style is what lets a freshly
          // shown popover transition FROM somewhere. Exit is instant — animating
          // it needs allow-discrete juggling for no reader benefit. Motion-safe,
          // so reduced-motion readers get an instant open too.
          'motion-safe:transition-[translate,opacity] motion-safe:duration-200 motion-safe:ease-out',
          side === 'right'
            ? 'motion-safe:starting:translate-x-8 motion-safe:starting:opacity-0'
            : 'motion-safe:starting:-translate-x-8 motion-safe:starting:opacity-0',
          panelClassName,
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {title ? (
            <p id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            popoverTarget={panelId}
            // `hide`, not the default toggle: a toggling close button REOPENS
            // the panel if anything else has closed it in between.
            popoverTargetAction="hide"
            aria-label={closeLabel}
            className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {children ?? (
          <>
            <nav className="mt-6 flex flex-col gap-1">
              {(links ?? []).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-md px-3 text-base hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            {cta ? (
              <a
                href={cta.href}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {cta.label}
              </a>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

export const DrawerShowcase = [
  {
    label: 'Mobile navigation',
    props: {
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
  },
  {
    label: 'Filters from the left, no title',
    props: {
      triggerLabel: 'Filters',
      side: 'left',
      links: [
        { label: 'Newest', href: '?sort=new' },
        { label: 'Price', href: '?sort=price' },
      ],
    },
  },
  {
    // Longhand on purpose: the extractor reads static literals only, and a
    // generated case is silently absent from design.json.
    label: 'Ten links, overlong label',
    props: {
      triggerLabel: 'Menu',
      title: 'Everything',
      links: [
        { label: 'A deliberately overlong navigation label that has to wrap', href: '#a' },
        { label: 'Two', href: '#b' },
        { label: 'Three', href: '#c' },
        { label: 'Four', href: '#d' },
        { label: 'Five', href: '#e' },
        { label: 'Six', href: '#f' },
        { label: 'Seven', href: '#g' },
        { label: 'Eight', href: '#h' },
        { label: 'Nine', href: '#i' },
        { label: 'Ten', href: '#j' },
      ],
    },
  },
];
