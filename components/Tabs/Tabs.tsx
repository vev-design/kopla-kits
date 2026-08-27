// A strip of labels over a single panel area, switched by `:target`. No
// JavaScript.
//
// Like Accordion, this exists because the platform already does it and the agent
// kept doing it differently. What it is, precisely — and the naming here is
// deliberate — is a strip of LINKS to sections, with CSS showing only the linked
// one. It is not an ARIA tablist, and it does not claim to be: a tablist promises
// arrow-key navigation between tabs and a `tab`/`tabpanel` relationship, and
// promising that on top of anchors would be a lie that reads fine and fails under
// a screen reader.
//
// The mechanism, all of it in CSS:
//
//   * `#panel:target` shows a panel. The fragment in the URL is the state, which
//     is why a tab is DEEP-LINKABLE — a link from elsewhere on the site can open
//     the page with the third tab showing, and no script has to run to honour it.
//   * `:not(:has(… :target))` shows the first panel when the URL names none, so
//     the default state needs no duplicate markup.
//   * One generated rule per tab marks the active label. `:has()` is what makes
//     that reachable from a sibling; before it, this needed the panels to precede
//     the strip in the DOM, which put the content before its own navigation.
//
// Two costs, stated rather than hidden, both inherent to doing this without JS:
//
//   1. Each tab is a real navigation, so it adds a history entry — browser Back
//      steps through the tabs before leaving the page. `scroll-mt-*` on the
//      panels keeps the strip on screen when the browser jumps to the target.
//   2. `aria-current` cannot be set from CSS, so the active label carries no
//      programmatic "selected" state. What a screen reader gets instead is the
//      right behaviour rather than the right adjective: activating the link moves
//      the reader to the panel it names. If a design genuinely needs the selected
//      state announced, that is the point at which tabs stop being free.

import { Children, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One tab and its panel. */
export interface TabsItem {
  /** The tab's label — short, since they sit in a row. 1–4 words. */
  title: string;
  /** The panel's copy. 1–4 sentences. */
  body?: string | null;
}

/**
 * A strip of labels over one panel area, switched with `:target`. No JavaScript,
 * no hydration, and each tab is a link you can point at from anywhere.
 *
 * Pass the panels as `children` to keep the design's own markup — one node per
 * tab, in tab order.
 */
export interface TabsProps {
  /** The tabs, in order. 2–6 entries — a row of labels stops being scannable
   *  after that, and a phone runs out of width. */
  items: TabsItem[];
  /** Authored panels, one node per tab, zipped with `items` by position. A tab
   *  with no matching child falls back to its own `body`. */
  children?: ReactNode;
  /** Where the strip sits. `underline` is a row of labels over a rule; `pill` is
   *  a segmented control. */
  look?: 'underline' | 'pill';
  /** Classes for the tabs' own box. */
  className?: string;
  /** Classes for each panel. */
  panelClassName?: string;
  /** Id root. Panels get `<id>-<slug>`, which is what a deep link points at, so
   *  pass a readable one when the URL matters. */
  id?: string;
}

/**
 * A stable id derived from the component's own content.
 *
 * Not `useId`: this component is static — no `@hydrate`, no client JS — and a
 * hook would make it a client component for the sake of a string. Panel ids have
 * to be unique on the page because `:target` matches document ids, and they have
 * to be stable across renders because they end up in URLs.
 */
function contentId(parts: string[]): string {
  let hash = 0;
  for (const char of parts.join(' ')) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * An author's `id` as something a CSS selector can name.
 *
 * The generated rules select `#<rootId>`, and a CSS identifier cannot start with
 * a digit — so `id="2024-report"` makes every rule in the block invalid, the
 * browser drops them, and the component renders as all panels at once. Readable,
 * and not tabs. Cheaper to sanitise than to debug.
 */
function safeId(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_-]/g, '-');
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `tabs-${cleaned}`;
}

/** A tab title as a URL fragment: `Getting started` → `getting-started`. Readable
 *  because it is what a shared link shows. */
function slug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'panel'
  );
}

export function Tabs({
  items,
  children,
  look = 'underline',
  className,
  panelClassName,
  id,
}: TabsProps) {
  if (items.length === 0) return null;

  const authored = Children.toArray(children).filter(
    (c) => isValidElement(c) || typeof c === 'string',
  );
  const rootId = id ? safeId(id) : `tabs-${contentId(items.map((item) => item.title))}`;
  // Deduplicated by index, because two tabs called "Overview" would otherwise
  // produce two elements with one id and `:target` would show whichever the
  // browser found first.
  const panelIds = items.map((item, i) => `${rootId}-${slug(item.title)}-${i + 1}`);

  const active =
    look === 'pill'
      ? 'background-color:var(--primary);color:var(--primary-foreground);'
      : 'color:var(--primary);border-bottom-color:var(--primary);';

  const css = [
    `#${rootId} [data-slot="tabs-panel"]{display:none}`,
    `#${rootId} [data-slot="tabs-panel"]:target{display:block}`,
    // The default: no fragment names a panel, so the first one shows.
    `#${rootId}:not(:has([data-slot="tabs-panel"]:target)) [data-slot="tabs-panel"]:first-of-type{display:block}`,
    `#${rootId}:not(:has([data-slot="tabs-panel"]:target)) [data-slot="tabs-tab"]:first-of-type{${active}}`,
    ...panelIds.map(
      (panelId) =>
        `#${rootId}:has(#${panelId}:target) [data-slot="tabs-tab"][href="#${panelId}"]{${active}}`,
    ),
  ].join('\n');

  return (
    <div id={rootId} data-slot="tabs" className={cn('flex flex-col gap-5', className)}>
      {/* Generated per instance because the active-label rules name each panel's
          id. Same shape as Marquee's keyframes: a component that needs CSS the
          utility layer cannot express ships that CSS with itself. */}
      <style>{css}</style>

      <div
        data-slot="tabs-strip"
        className={cn(
          'flex flex-wrap items-stretch',
          look === 'underline' ? 'gap-4 border-b' : 'gap-1 rounded-full border p-1',
        )}
      >
        {items.map((item, i) => (
          <a
            key={i}
            href={`#${panelIds[i]}`}
            data-slot="tabs-tab"
            className={cn(
              // 44px, and centred: a tab is a touch target before it is a label.
              'inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium text-muted-foreground no-underline',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'motion-safe:transition-colors',
              look === 'underline'
                ? // `-mb-px` so the tab's own border sits ON the strip's rule
                  // rather than a pixel under it.
                  '-mb-px border-b-2 border-transparent'
                : 'rounded-full',
            )}
          >
            {item.title}
          </a>
        ))}
      </div>

      <div>
        {items.map((item, i) => (
          <section
            key={i}
            id={panelIds[i]}
            data-slot="tabs-panel"
            // Named by its own tab, so a reader taken here by the link knows what
            // they arrived at.
            aria-label={item.title}
            // The browser scrolls to a `:target`, and without this the strip
            // lands just above the viewport — the reader ends up looking at a
            // panel with no visible way back to the other tabs.
            className={cn('scroll-mt-24', panelClassName)}
          >
            {authored[i] ?? (item.body ? <p className="text-muted-foreground">{item.body}</p> : null)}
          </section>
        ))}
      </div>
    </div>
  );
}

export const TabsShowcase = [
  {
    label: 'Underline — three tabs',
    props: {
      className: 'max-w-2xl',
      items: [
        {
          title: 'Overview',
          body: 'Kopla reads your design system and writes pages out of it. You review the copy and publish to your own domain.',
        },
        {
          title: 'Pricing',
          body: 'Free for one system and one domain. Team plans add shared systems and review links.',
        },
        {
          title: 'Support',
          body: 'Email, and a shared channel on team plans. Answers in a working day.',
        },
      ],
    },
  },
  {
    label: 'Pill — two tabs',
    props: {
      className: 'max-w-2xl',
      look: 'pill',
      items: [
        { title: 'For designers', body: 'Your system, applied without a hand-off.' },
        { title: 'For developers', body: 'Static HTML out, no runtime to keep alive.' },
      ],
    },
  },
  {
    label: 'Six tabs',
    props: {
      className: 'max-w-3xl',
      items: [
        { title: 'Discover', body: 'What the audit turns up, and what it means.' },
        { title: 'Define', body: 'The system, decided once.' },
        { title: 'Design', body: 'Pages out of the system, not beside it.' },
        { title: 'Build', body: 'Static output, your own domain.' },
        { title: 'Measure', body: 'Your analytics, not ours.' },
        { title: 'Iterate', body: 'Change the token, not the forty pages.' },
      ],
    },
  },
  {
    label: 'Long labels, no body',
    props: {
      className: 'max-w-2xl',
      items: [
        { title: 'A deliberately overlong tab label that has to wrap' },
        { title: 'Short' },
        { title: 'Another ordinary label' },
      ],
    },
  },
];
