import type { ReactNode } from 'react';

/**
 * The brand-editable surface of every archetype section.
 *
 * Archetype sections (ProposalHero, StatBand, EvidenceChart, …) are adopted
 * into a design system verbatim and never edited, so that an upstream fix
 * reaches every brand on its next adoption. What a brand changes is THIS
 * file: each slot is a place an archetype reserves for the brand's own
 * device — the geometry that frames a focal statistic, the lines that echo a
 * quotation, the keyline around a page — and every slot is empty by default,
 * so an archetype renders its neutral form until the brand fills it.
 *
 * Fill a slot with a component from this design system, for example:
 *
 *   import { BrandFrame } from '@/components/BrandFrame';
 *   export const archetypeSlots: ArchetypeSlots = {
 *     statFrame: (_ctx, figure) => <BrandFrame variant="squares">{figure}</BrandFrame>,
 *   };
 *
 * Slots receive ReactNodes or small context objects and return ReactNodes.
 * They are called during server rendering, so they must be static: no hooks,
 * no browser APIs. A slot that returns `null` falls back to the neutral form.
 */
export interface ArchetypeSlots {
  /** A decorative device behind or beside a hero title (ProposalHero, ProposalClosing). */
  heroDevice?: (ctx: { variant: string }) => ReactNode;
  /** Wraps a whole band's content — a keyline, a frame, a colour block. */
  pageFrame?: (children: ReactNode) => ReactNode;
  /** Wraps or decorates one focal figure in a StatBand. */
  statFrame?: (ctx: { index: number; count: number }, figure: ReactNode) => ReactNode;
  /** Handed to the Chart primitive's own `frame` slot (EvidenceChart). */
  chartFrame?: ReactNode;
  /** Wraps the table in an EvidenceTable. */
  tableFrame?: (children: ReactNode) => ReactNode;
  /** Decoration around a quotation (Quote): echo lines, a large mark. */
  quoteDecoration?: (ctx: { variant: string }) => ReactNode;
  /** Wraps a portrait image (Quote): concentric circles, a cropped frame. */
  portraitFrame?: (image: ReactNode) => ReactNode;
  /** A surface texture or pattern behind a narrative band (Narrative). */
  sectionDevice?: (ctx: { background: string }) => ReactNode;
  /** The marker beside each step (Steps): a numeral, a device, a dot. */
  stepMarker?: (ctx: { index: number; count: number }) => ReactNode;
}

/** Neutral defaults: every slot empty. Replace entries with the brand's own. */
export const archetypeSlots: ArchetypeSlots = {};
