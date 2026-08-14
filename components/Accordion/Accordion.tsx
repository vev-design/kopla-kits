// A stacked disclosure list built on `<details>` / `<summary>`. No client JS:
// the browser owns open/closed state, keyboard handling and the ARIA the
// pattern needs, so a section hosting this publishes as static HTML.
//
// `exclusive` gives every panel the same `name`, which is what makes the
// browser close the others — the native equivalent of a `useState` index,
// with no state to render on the server and get wrong.

import { cn } from '@/lib/utils';

/**
 * A stacked question/answer list where each panel expands in place. Native
 * `<details>`, so it works with JavaScript disabled and needs no hydration.
 * Best with 3–8 items; put the answer in one or two short paragraphs.
 */
export interface AccordionProps {
  /** The panels, in order. 3–8 items. */
  items: {
    /** The always-visible summary line. 1 sentence, max 12 words, no trailing period. */
    question: string;
    /** The revealed body. 1–3 sentences, 15–60 words. */
    answer: string;
  }[];
  /** Open one panel at a time (opening one closes the rest). Default true. */
  exclusive?: boolean;
  /** Index of the panel open on first paint, or null for all closed. */
  defaultOpen?: number | null;
  /** Visual treatment. `divided` rules between rows; `card` boxes each row. */
  variant?: 'divided' | 'card';
}

export function Accordion({
  items,
  exclusive = true,
  defaultOpen = null,
  variant = 'divided',
}: AccordionProps) {
  // One shared `name` per rendered Accordion makes the group exclusive. It is
  // constant rather than unique-per-instance on purpose: the value only has to
  // be stable between server and client, and a random id would differ across
  // the two renders and break hydration for any section that does hydrate for
  // other reasons.
  const groupName = exclusive ? 'kk-accordion' : undefined;

  return (
    <div className={cn('w-full', variant === 'card' ? 'space-y-3' : 'divide-y divide-border border-y border-border')}>
      {items.map((item, i) => (
        <details
          key={item.question}
          name={groupName}
          open={defaultOpen === i || undefined}
          className={cn(
            'group',
            variant === 'card' && 'rounded-lg border border-border bg-card px-5',
          )}
        >
          <summary
            className={cn(
              // `list-none` + the webkit pseudo-element remove the default
              // triangle; the chevron below replaces it.
              'flex cursor-pointer list-none items-center justify-between gap-5 py-5',
              'text-left font-medium text-foreground',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              '[&::-webkit-details-marker]:hidden',
            )}
          >
            {item.question}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            >
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div className="pb-5 text-muted-foreground">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

export const AccordionShowcase = [
  {
    props: {
      items: [
        {
          question: 'What happens if I am not home for the delivery',
          answer: 'The box is insulated and stays cold for up to 12 hours, so it can wait on your doorstep until you get back.',
        },
        {
          question: 'Can I skip a week',
          answer: 'Yes. Skip, pause or cancel any week up to five days before your delivery, with no fee.',
        },
        {
          question: 'Is there a minimum commitment',
          answer: 'None. The subscription is flexible from the first box onward.',
        },
      ],
      defaultOpen: 0,
    },
    label: 'FAQ, first panel open',
  },
  {
    props: {
      items: [
        { question: 'Starter', answer: 'Everything one person needs to publish a first site.' },
        { question: 'Team', answer: 'Shared design systems, approvals and custom domains.' },
        { question: 'Enterprise', answer: 'SSO, audit logs and a dedicated environment.' },
      ],
      variant: 'card',
      exclusive: false,
    },
    label: 'Cards, independent panels',
  },
];
