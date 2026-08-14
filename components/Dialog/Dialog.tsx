// A centred modal built on the native popover API. No client JS: the trigger's
// `popovertarget` opens it, and the browser supplies the top layer, the
// backdrop, light-dismiss (click outside / Escape) and focus handling.
//
// Built on `popover` rather than `<dialog>` deliberately: `<dialog>` only goes
// modal via `showModal()`, which is a script call, so a dialog element in a
// page with no JavaScript never opens. `popover` is declarative end to end.

import { cn } from '@/lib/utils';

/**
 * A centred modal panel opened by its own trigger button. Native popover:
 * backdrop, Escape-to-close and click-outside come from the browser, with
 * no JavaScript, so the section stays static.
 */
export interface DialogProps {
  /**
   * Unique id for this dialog on the page — the trigger references it.
   * kebab-case, e.g. "book-a-demo".
   */
  id: string;
  /** Trigger button label. 1–4 words, sentence case. */
  triggerLabel: string;
  /** Dialog heading. 1 sentence, max 8 words. */
  title: string;
  /** Supporting copy under the heading. 1–3 sentences, 15–60 words. */
  body: string;
  /** Optional primary action link. */
  action?: {
    /** Button label. 1–3 words, sentence case. */
    label: string;
    /** Destination. */
    href: string;
  } | null;
  /** Visual weight of the trigger. */
  triggerVariant?: 'primary' | 'outline' | 'link';
}

const TRIGGER: Record<NonNullable<DialogProps['triggerVariant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg',
  outline: 'border border-border text-foreground hover:bg-accent px-5 py-2.5 rounded-lg',
  link: 'text-primary underline underline-offset-4 hover:no-underline',
};

export function Dialog({
  id,
  triggerLabel,
  title,
  body,
  action = null,
  triggerVariant = 'primary',
}: DialogProps) {
  const titleId = `${id}-title`;

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className={cn(
          'inline-flex items-center justify-center text-sm font-medium transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          TRIGGER[triggerVariant],
        )}
      >
        {triggerLabel}
      </button>

      <div
        id={id}
        popover="auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'w-[min(28rem,92vw)] rounded-xl border border-border bg-background p-6 text-foreground shadow-lg',
          // Popovers land in the top layer; `m-auto` centres in the viewport.
          'm-auto',
          'backdrop:bg-black/40',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-medium">
            {title}
          </h2>
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>

        {action ? (
          <a
            href={action.href}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {action.label}
          </a>
        ) : null}
      </div>
    </>
  );
}

export const DialogShowcase = [
  {
    props: {
      id: 'book-a-demo',
      triggerLabel: 'Book a demo',
      title: 'See it on your own brand',
      body: 'Thirty minutes, no slides. Bring a page you want rebuilt and we will do it live.',
      action: { label: 'Pick a time', href: '#calendar' },
    },
    label: 'Call to action',
  },
  {
    props: {
      id: 'shipping-terms',
      triggerLabel: 'Shipping details',
      triggerVariant: 'link',
      title: 'Delivery and returns',
      body: 'Orders placed before 14:00 ship the same day. Returns are free within 30 days.',
    },
    label: 'Inline detail link',
  },
];
