import { Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * High-intent registration moment for a live enterprise webinar. Use after the opening promise when attendees need a concise agenda and a native, on-page signup.
 */
export interface WebinarRegistrationProps extends SectionBaseProps {
  /** Small event category label. 2–5 words, uppercase styling is applied by the section. */
  eyebrow: string;
  /** Event title. 6–12 words, no trailing period. */
  headline: string;
  /** One-sentence invitation that names the business outcome. 16–28 words. */
  body: string;
  /** Date and time line. Include weekday, month, date, time, and timezone; maximum 48 characters. */
  eventDetails: string;
  /** Brief list of discussion outcomes. 3 items; each item 3–8 words. */
  takeaways: string[];
  /** Capture endpoint supplied for this specific form. @kind formAction */
  action: string;
  /** Submit-button label. 2–4 words, sentence case. */
  submitLabel: string;
  /** Consent or privacy line beneath the submit action. 10–22 words. */
  privacyNote: string;
  /** Heading shown after a successful submission. 3–8 words. */
  successHeadline: string;
  /** One-sentence confirmation shown after a successful submission. 10–22 words. */
  successBody: string;
}

export function WebinarRegistration({
  id,
  eyebrow,
  headline,
  body,
  eventDetails,
  takeaways,
  action,
  submitLabel,
  privacyNote,
  successHeadline,
  successBody,
}: WebinarRegistrationProps) {
  return (
    <section id={id ?? undefined} className="overflow-clip bg-secondary px-5 py-18 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1fr_.82fr] lg:gap-20">
        <div className="pt-2">
          <p className="text-sm font-[550] tracking-[.08em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-5 max-w-3xl text-5xl font-[350] leading-[.92] tracking-[-.07em] lg:text-7xl">{headline}</h2>
          <p className="mt-7 max-w-xl text-xl leading-snug text-muted-foreground lg:text-2xl">{body}</p>
          <div className="mt-12 border-t border-foreground/15 pt-6">
            <p className="text-lg font-[500]">{eventDetails}</p>
            <ul className="mt-7 grid gap-4 text-lg">
              {takeaways.map((takeaway, index) => (
                <li key={takeaway} className="flex gap-4 border-b border-foreground/10 pb-4">
                  <span className="text-muted-foreground">0{index + 1}</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="self-start rounded-xl bg-background p-6 shadow-[0_18px_50px_-28px_oklch(from_#0d0d0d_l_c_h)] sm:p-9">
          <form method="post" action={action} className="grid gap-5" data-kopla-form-state="idle">
            <div className="grid gap-2">
              <label htmlFor={`${id ?? 'webinar'}-name`} className="text-sm font-[550]">Full name</label>
              <input id={`${id ?? 'webinar'}-name`} name="name" autoComplete="name" required className="h-12 rounded-md border bg-background px-3 text-base outline-none transition focus:border-foreground" />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${id ?? 'webinar'}-email`} className="text-sm font-[550]">Work email</label>
              <input id={`${id ?? 'webinar'}-email`} name="email" type="email" autoComplete="email" required className="h-12 rounded-md border bg-background px-3 text-base outline-none transition focus:border-foreground" />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${id ?? 'webinar'}-company`} className="text-sm font-[550]">Company</label>
              <input id={`${id ?? 'webinar'}-company`} name="company" autoComplete="organization" required className="h-12 rounded-md border bg-background px-3 text-base outline-none transition focus:border-foreground" />
            </div>
            <input type="text" name="_kopla_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
            <Button type="submit" size="lg" className="mt-1 w-full">{submitLabel}</Button>
            <p className="text-xs leading-relaxed text-muted-foreground">{privacyNote}</p>
          </form>
          <div data-kopla-form-success hidden className="py-12">
            <p className="text-sm font-[550] tracking-[.08em] text-muted-foreground">REGISTRATION CONFIRMED</p>
            <h3 className="mt-4 text-4xl font-[350] leading-[.95] tracking-[-.06em]">{successHeadline}</h3>
            <p className="mt-5 text-lg leading-snug text-muted-foreground">{successBody}</p>
          </div>
          <div data-kopla-form-error hidden className="py-12">
            <h3 className="text-3xl font-[350] tracking-[-.05em]">That didn’t send</h3>
            <p className="mt-4 text-lg text-muted-foreground">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export const WebinarRegistrationDemo: WebinarRegistrationProps = {
  id: 'register',
  eyebrow: 'Live webinar',
  headline: 'Turn enterprise strategy into coordinated action',
  body: 'See how leading teams remove work about work and keep strategic priorities moving with clarity.',
  eventDetails: 'Thursday, October 23 · 10:00 AM PT',
  takeaways: ['Align work to business priorities', 'Surface risk before it compounds', 'Build operational visibility at scale'],
  action: '/__kopla/forms/contact',
  submitLabel: 'Reserve my seat',
  privacyNote: 'By registering, you agree to receive webinar details and relevant Asana communications.',
  successHeadline: 'You’re on the list',
  successBody: 'Your registration is confirmed. Watch your inbox for your calendar invitation and joining details.',
};
