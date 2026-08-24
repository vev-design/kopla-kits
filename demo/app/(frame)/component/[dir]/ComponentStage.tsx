'use client';

// What the lab's iframe actually renders: one catalog component, one showcase
// case, nothing else. No chrome — the controls live in the parent document, so
// this frame is exactly the component in a real viewport of a real width.
//
// A CLIENT component that is nonetheless SERVER-RENDERED, which is the whole
// trick behind the no-JS pass. Next SSRs the client graph to HTML and then
// hydrates it; if the iframe withholds `allow-scripts`, the HTML arrives and
// hydration never happens — which is precisely what a published Kopla page does
// when its section carries no `@hydrate` tag. So "does this degrade to readable"
// becomes a thing you can look at instead of a thing you hope about.
//
// That is also why `registry` uses static imports and this file reads its state
// from props rather than from `window.location`: anything resolved in an effect
// is absent in the one mode that matters most. Theming follows the same rule —
// it is a server-rendered <link> in page.tsx, not a concern of this stage.

import { type ReactNode } from 'react';
import { registry } from '../../../../components.gen/registry';

interface Props {
  dir: string;
  /** Index into the component's showcase cases. */
  index: number;
  reducedMotion: boolean;
}

/**
 * A render failure has to stay inside the frame.
 *
 * The lab's job is to show what a component does, and "it throws on 10 items"
 * IS what it does — a blank iframe with the error only in the console would
 * hide the most useful finding the content switcher can produce.
 */
function StageError({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        margin: '1rem',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        background: '#fef2f2',
        color: '#b91c1c',
        font: '500 13px/1.5 ui-monospace, monospace',
      }}
    >
      {children}
    </div>
  );
}

export function ComponentStage({ dir, index, reducedMotion }: Props) {
  const entry = registry[dir];

  if (!entry) return <StageError>No component named “{dir}” in the catalog.</StageError>;
  if (!entry.component) {
    return (
      <StageError>
        {dir} exports no component under that name — check the export matches
        `component.json`’s `name`.
      </StageError>
    );
  }
  if (entry.cases.length === 0) {
    return (
      <StageError>
        {dir} has no <code>{dir}Showcase</code> cases. The contract is an array of{' '}
        <code>{'{ props, label? }'}</code> static literals — without them there is nothing to
        preview, and nothing for the content switcher to stress.
      </StageError>
    );
  }

  const active = entry.cases[Math.min(Math.max(index, 0), entry.cases.length - 1)];
  if (!active) return <StageError>Showcase case {index} is missing.</StageError>;

  const Component = entry.component;
  return (
    <div
      // What the REGISTRY sees, published for the specs to check against what the
      // manifest scanner saw. Two readers of one contract — the scanner reads the
      // source text, this reads the real module — and the specs enumerate cases
      // from the scanner while the frame renders from the registry. When they
      // disagree the specs address `?case=` numbers past the end, which clamps,
      // so the suite goes green while retesting one case. Cheap to publish, and
      // it turns that whole failure mode into an assertion.
      data-case-count={entry.cases.length}
      data-case-label={active.label}
      // Honoured by any component that respects the media query, and by the
      // motion wrappers. A class as well as the emulated query, because
      // Playwright can force the query but a human clicking the toggle cannot.
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      style={reducedMotion ? ({ '--motion-duration': '0s' } as React.CSSProperties) : undefined}
    >
      {reducedMotion ? (
        <style>{`*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;scroll-behavior:auto!important}`}</style>
      ) : null}
      <Component {...active.props} />
    </div>
  );
}
