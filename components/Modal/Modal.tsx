// A dialog on a trigger, using the `popover` attribute. No JavaScript.
//
// This is the one in the set where the platform's version is not merely
// equivalent to a hand-rolled component but strictly better, and it is worth
// knowing exactly what `popover` hands over for free:
//
//   * the TOP LAYER, so the dialog paints above everything regardless of what
//     `z-index` or `overflow` the surrounding page has. This is the part nobody
//     reproduces correctly — a hand-rolled modal inside a section with
//     `overflow: hidden` or a transformed ancestor is clipped or mispositioned,
//     and the fix is always a portal, which is client JS.
//   * `::backdrop`, a real element to dim the page with.
//   * light dismiss — click outside to close — and Escape.
//   * focus moved into the dialog on open and RETURNED to the trigger on close.
//   * the trigger's expanded state, wired by the browser from `popovertarget`.
//
// What it does not do, stated plainly: `popover` does not TRAP focus. Tab from
// the last control inside continues into the page behind. A true modal needs
// `<dialog>.showModal()`, which is a script, which is `@hydrate`, which is a
// runtime on the page — and for the things a marketing page opens (a detail
// panel, a form, an image) the trap is not worth that. If a design genuinely
// needs focus trapped, that is the point at which this component stops fitting.

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A dialog opened by its own trigger button, built on the `popover` attribute:
 * top layer, backdrop, light dismiss, Escape and focus return, with no
 * JavaScript and nothing to hydrate.
 *
 * Pass the dialog's contents as `children` to keep the design's own markup.
 */
export interface ModalProps {
  /** The trigger button's label. 1–4 words. */
  trigger: string;
  /** The dialog's heading, and its accessible name. 2–8 words. */
  title: string;
  /** The dialog's copy, when it is not given its own markup. 1–4 sentences. */
  body?: string | null;
  /** The dialog's contents. Replaces `body`. */
  children?: ReactNode;
  /** How the trigger is drawn. */
  triggerLook?: 'primary' | 'outline' | 'link';
  /** How wide the panel is allowed to get. */
  size?: 'sm' | 'md' | 'lg';
  /** The close control's label, for a screen reader. Default `Close`. */
  closeLabel?: string;
  /** Classes for the trigger. */
  className?: string;
  /** Classes for the dialog panel. */
  panelClassName?: string;
  /** Id root, and what `popovertarget` points at. Pass one when two modals with
   *  the same title could share a page. */
  id?: string;
}

/**
 * A stable id derived from the component's own content.
 *
 * Not `useId`: this component is static — no `@hydrate`, no client JS — and a
 * hook would make it a client component for the sake of a string. The id has to
 * be unique on the page because `popovertarget` resolves it, and two modals
 * sharing one would make both triggers open the first dialog.
 */
function contentId(parts: string[]): string {
  let hash = 0;
  for (const char of parts.join(' ')) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * The close glyph, inline rather than from `lucide-react`.
 *
 * Not a style preference — a correctness one. Every lucide icon renders through
 * `Icon`, which is `'use client'` and reads a context, so importing one into a
 * static component quietly creates a client boundary and ships a runtime for a
 * cross. The component would still pass a hydration check (this file has no
 * hooks and no `'use client'` of its own) while the page it lands on stops being
 * the pure HTML this component's whole point is. Sixteen lines of SVG is the
 * cheaper end of that trade.
 *
 * `lucide-react` is fine in a component that already declares `@hydrate`.
 */
function CloseGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-4"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const WIDTH = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

const TRIGGER = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline underline-offset-4 hover:opacity-80',
} as const;

export function Modal({
  trigger,
  title,
  body,
  children,
  triggerLook = 'primary',
  size = 'md',
  closeLabel = 'Close',
  className,
  panelClassName,
  id,
}: ModalProps) {
  const rootId = id ?? `modal-${contentId([trigger, title])}`;
  const panelId = `${rootId}-panel`;
  const titleId = `${rootId}-title`;

  return (
    <>
      <button
        type="button"
        // The whole opening mechanism. The browser also gives this button the
        // expanded state and the relationship to the panel, so there is no
        // `aria-expanded` or `aria-controls` here on purpose — hand-written ones
        // would have to be kept truthful, and keeping them truthful is state.
        popoverTarget={panelId}
        className={cn(
          'inline-flex min-h-11 items-center rounded-md px-5 text-sm font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          TRIGGER[triggerLook],
          className,
        )}
      >
        {trigger}
      </button>

      <div
        id={panelId}
        // `auto` rather than `manual`: it is what brings light dismiss and
        // Escape, and closes any other open popover — which is the behaviour a
        // reader expects and a manual popover leaves you to write.
        popover="auto"
        data-slot="modal"
        // `dialog` for the role and the heading for the name. `aria-modal` is
        // deliberately absent: it would claim the rest of the page is
        // unreachable, and without a focus trap that claim is false.
        role="dialog"
        aria-labelledby={titleId}
        className={cn(
          // `m-auto` looks redundant — the UA stylesheet already centres a
          // popover with `margin: auto` — and is not: Tailwind's preflight zeroes
          // margin on every element, which silently overrides that UA rule and
          // parks the dialog in the top-left corner. Found by eye under a theme,
          // in every theme, after every test had passed.
          'm-auto w-[calc(100vw-2rem)] rounded-xl border bg-card p-6 text-card-foreground shadow-lg',
          // A long dialog scrolls rather than growing past the viewport, which is
          // where a modal's content becomes unreachable on a phone.
          'max-h-[calc(100dvh-4rem)] overflow-y-auto',
          WIDTH[size],
          // The dim behind it. `backdrop:` is the variant for `::backdrop`, and
          // the colour is a token so the dimming matches each system.
          'backdrop:bg-foreground/40',
          panelClassName,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            popoverTarget={panelId}
            // `hide` rather than the default toggle: a close button that toggles
            // reopens the dialog if anything else has closed it in between.
            popoverTargetAction="hide"
            // `aria-label`, not visible text: the label is for a screen reader,
            // and the glyph is the drawing.
            aria-label={closeLabel}
            className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseGlyph />
          </button>
        </div>
        <div className="mt-3 text-muted-foreground">
          {children ?? (body ? <p>{body}</p> : null)}
        </div>
      </div>
    </>
  );
}

export const ModalShowcase = [
  {
    label: 'Primary trigger',
    props: {
      trigger: 'See the details',
      title: 'What is included',
      body: 'Every plan includes the full component catalog, unlimited pages and your own domain. Team plans add shared systems and review links for stakeholders.',
    },
  },
  {
    label: 'Outline trigger, small',
    props: {
      trigger: 'Terms',
      title: 'Terms of service',
      triggerLook: 'outline',
      size: 'sm',
      body: 'The short version: your content is yours, we do not train on it, and you can export at any time.',
    },
  },
  {
    label: 'Link trigger, large, long body',
    props: {
      trigger: 'Read the full policy',
      title: 'Privacy policy',
      triggerLook: 'link',
      size: 'lg',
      body: 'A deliberately long body, so the panel has to scroll inside itself rather than growing past the bottom of a phone. We collect what is needed to render your pages and nothing else. Your design system is read from the file you point us at, and the extracted tokens are stored against your account so a rebuild does not need to read it again. Analytics on your published pages are whatever you install; nothing is injected. Data is deleted within thirty days of an account closing, and you can export everything before that from the account page. Questions go to the address in the footer, and we answer them within a working day.',
    },
  },
  {
    label: 'Long title, no body',
    props: {
      trigger: 'Open',
      title:
        'A deliberately overlong dialog heading that has to wrap onto several lines without pushing the close control off the panel',
    },
  },
];
