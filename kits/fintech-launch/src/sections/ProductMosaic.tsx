import { Badge, Button, Card } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A dramatic dark product overview that introduces multiple account capabilities as an editorial tile composition. */
export interface ProductMosaicProps extends SectionBaseProps {
  /** Small category marker. 1–2 uppercase words. */ eyebrow?: string | null;
  /** Dominant section statement. 4–10 words, no trailing period. */ headline: string;
  /** Supporting action leading to the full product area. */ action?: { label: string; /** @kind url */ href: string } | null;
  /** Capability tiles. 3–5 items, each with a 2–6 word title and one short sentence. */ items: { title: string; body: string; accent?: 'plain' | 'gradient' }[];
}
export function ProductMosaic({ id, eyebrow, headline, action, items }: ProductMosaicProps) {
  return <section id={id ?? undefined} className="bg-[var(--dark)] px-5 py-24 text-primary-foreground sm:px-8 lg:px-12 lg:py-32">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          {eyebrow ? <Badge label={eyebrow} variant="subtle" className="bg-primary-foreground/10 text-primary-foreground" /> : null}
          <h2 className="mt-5 max-w-3xl text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[.93] tracking-[-0.02em]">{headline}</h2>
        </div>
        {action ? <Button {...action} variant="outline" className="self-start text-primary-foreground hover:bg-primary-foreground/10 md:self-auto" /> : null}
      </div>

      <div className="mt-14 grid auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
        {items.map((item, index) => {
          const layout = index === 0
            ? 'min-h-[31rem] lg:col-span-7 lg:row-span-2'
            : index === 1
              ? 'min-h-[15rem] lg:col-span-5'
              : index === 2
                ? 'min-h-[15rem] lg:col-span-5'
                : 'min-h-[15rem] lg:col-span-4';

          return <Card key={item.title} title={item.title} body={item.body} variant="dark" padding="spacious" className={`relative isolate flex h-full flex-col overflow-clip border border-primary-foreground/10 ${layout} ${item.accent === 'gradient' ? 'qonto-gradient-border shadow-2xl shadow-black/40' : ''}`}>
            {index === 0 ? <>
              <div aria-hidden className="pointer-events-none absolute -right-18 -top-20 size-80 rounded-full border border-primary-foreground/15" />
              <div aria-hidden className="pointer-events-none absolute -right-4 top-8 size-52 rounded-full border border-primary-foreground/10" />
              <div aria-hidden className="pointer-events-none absolute inset-x-10 bottom-10 grid grid-cols-4 gap-3 opacity-80 sm:inset-x-14">
                {[36, 58, 45, 76].map((height, barIndex) => <div key={barIndex} className="rounded-t-lg bg-primary-foreground/12" style={{ height: `${height}%` }} />)}
              </div>
              <div className="relative mt-auto flex items-end justify-between border-t border-primary-foreground/10 pt-5">
                <span className="text-sm text-primary-foreground/55">Today&apos;s position</span>
                <span className="text-4xl font-semibold tracking-[-0.02em]">All clear</span>
              </div>
            </> : index === 1 ? <>
              <div aria-hidden className="pointer-events-none absolute right-7 top-7 grid size-24 grid-cols-2 gap-2 opacity-75">
                {[0, 1, 2, 3].map((cell) => <span key={cell} className={cell === 3 ? 'rounded-md bg-primary-foreground' : 'rounded-md bg-primary-foreground/15'} />)}
              </div>
              <div className="relative mt-auto flex items-center gap-3 border-t border-primary-foreground/10 pt-4 text-sm text-primary-foreground/60"><span className="size-2 rounded-full bg-primary-foreground" /> Shared and in sync</div>
            </> : <>
              <div aria-hidden className="pointer-events-none absolute right-7 top-8 flex items-end gap-1.5 opacity-70">
                {[18, 32, 24, 43, 55].map((height, barIndex) => <span key={barIndex} className="w-3 rounded-t-sm bg-primary-foreground/25" style={{ height }} />)}
              </div>
              <div className="relative mt-auto flex items-center justify-between border-t border-primary-foreground/10 pt-4 text-sm text-primary-foreground/60"><span>Automation active</span><span className="rounded-full bg-primary-foreground/10 px-2.5 py-1">On</span></div>
            </>}
          </Card>;
        })}
      </div>
    </div>
  </section>;
}
export const ProductMosaicDemo: ProductMosaicProps = { id: 'account', eyebrow: 'Business finance', headline: 'Your all-in-one business account', action: { label: 'Discover our business account', href: '#tools' }, items: [{ title: 'Account remuneration', body: 'Earn up to 5% on your Qonto account balance.', accent: 'plain' }, { title: 'Get paid faster', body: 'Send invoices, share payment links, and follow every transaction.', accent: 'gradient' }, { title: 'Credit suite', body: 'Access working capital solutions integrated into your account.', accent: 'plain' }, { title: 'Cards for every team', body: 'Set clear limits and keep spend visible in real time.', accent: 'plain' }] };
