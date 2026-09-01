// The STYLED StepFlow — the lab's demo, and the fallback for a design that drew
// no quiz or stepper UI of its own.
//
// It lives OUTSIDE `StepFlow.tsx` and is NOT copied into a workspace
// (`scripts/build-components.mjs` skips `*.demo.tsx` the same way it skips
// `skeleton.*`). This component is why that rule exists: its scaffold — a
// vertical option list, a step counter, a Next button — was copied over a
// design that drew clickable answer cards, its own "Question 1 / 3" and no Next
// at all, and the result read as the product ignoring the design. The scaffold
// was never wrong; it was never meant to leave the lab.
//
// So what belongs here is exactly what a LOOK is: classes, glyphs, spacing,
// layout. What must NEVER live here is behaviour — if a property would be true
// of every design with a stepped flow in it (locking, scoring, focus, the
// answer-advances rule), it belongs in the engine or the primitives, or an
// authored section silently loses it.

import { Children, isValidElement, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  StepFlowBack,
  StepFlowNext,
  StepFlowOption,
  StepFlowPanel,
  StepFlowProgress,
  StepFlowResult,
  StepFlowRoot,
  useStepFlow,
} from './StepFlow';

/** One answer to a `quiz` step. */
export interface StepFlowChoice {
  /** The answer as the reader sees it. 1–8 words. */
  label: string;
  /** Marks the right answer. Exactly one option per step should set it. */
  correct?: boolean;
  /** Shown once the step is answered — why this option is right or wrong. */
  feedback?: string | null;
}

/** One step of the flow. */
export interface StepFlowStep {
  /** The step's heading, or the question in `quiz` mode. 2–12 words. */
  title: string;
  /** Body copy, or a preamble to the question. 1–3 sentences. */
  body?: string | null;
  /** Small label above the title — a phase, a chapter, a category. */
  kicker?: string | null;
  /** Illustration for this step. @kind image */
  image?: string | null;
  /** `quiz` only: the answers. 2–5 entries, exactly one marked `correct`. */
  options?: StepFlowChoice[];
}

/**
 * A guided flow shown one step at a time, with a progress indicator and
 * next/back controls. In `quiz` mode each step is a question that is checked as
 * it is answered, and the flow ends on a score.
 *
 * Pass the panels as `children` to keep the design's own markup — one node per
 * step, in step order. `steps` still carries each step's title (and, for a quiz,
 * its options), because the progress indicator and the answer check are data the
 * mechanics need, not markup. And when the design drew its own quiz UI — answer
 * cards, its own counter, its own nav — do not use this wrapper at all: drive
 * the design's markup with `useStepFlow` + the StepFlow* primitives instead.
 * @hydrate
 */
export interface StepFlowProps {
  /** The steps, in order. 2–10 entries. */
  steps: StepFlowStep[];
  /** Authored panels, one node per step, zipped with `steps` by position. A step
   *  with no matching child falls back to its own `body`/`image`. */
  children?: ReactNode;
  /**
   * What the flow is.
   *
   * `stepper` — walk through the steps. Next is always available.
   * `quiz` — each step's `options` are a question; picking one locks the step and
   *   reveals its feedback, Next unlocks once answered, and the flow ends on a
   *   result panel with the score. Needs client JS to be a quiz at all.
   */
  mode?: 'stepper' | 'quiz';
  /** How progress is drawn. `dots` numbers every step, `bar` fills a track. */
  progress?: 'dots' | 'bar' | 'none';
  /** Label on the forward control. Defaults to `Next`, or `See result` on the
   *  last question of a quiz. */
  nextLabel?: string | null;
  /** Label on the back control. Default `Back`. */
  backLabel?: string;
  /** `quiz` only: heading on the result panel. */
  resultTitle?: string | null;
  /** `quiz` only: copy under the score. */
  resultBody?: string | null;
  /** `quiz` only: label on the control that clears the answers. */
  restartLabel?: string;
  /** Classes for the flow's own box — constrain the measure here (e.g.
   *  `max-w-2xl`). */
  className?: string;
  /** Classes for each step panel. */
  panelClassName?: string;
  /** Id root. Each step's panel gets `<id>-step-<n>`, so a link elsewhere on the
   *  page can point at one. */
  id?: string;
  /** Fires with the new step index whenever the flow moves. */
  onStepChange?: (index: number) => void;
}

/** The default panel: what a step looks like when the design passed no markup of
 *  its own. Deliberately plain — a design that cares replaces it wholesale. */
function DataPanel({ step }: { step: StepFlowStep }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-center">
      <div className="flex flex-col gap-3">
        {step.body ? <p className="text-muted-foreground">{step.body}</p> : null}
      </div>
      {step.image ? (
        <img src={step.image} alt="" className="h-56 w-full rounded-lg object-cover" />
      ) : null}
    </div>
  );
}

export function StepFlow({
  steps,
  children,
  mode = 'stepper',
  progress = 'dots',
  nextLabel,
  backLabel = 'Back',
  resultTitle = 'Your result',
  resultBody,
  restartLabel = 'Start over',
  className,
  panelClassName,
  id,
  onStepChange,
}: StepFlowProps) {
  const count = steps.length;

  // Authored panels win, per step. `Children.toArray` drops nullish entries, so a
  // section mapping over its own data with a conditional doesn't shift the zip.
  const authored = Children.toArray(children).filter(
    (c) => isValidElement(c) || typeof c === 'string',
  );

  const autoId = useId();
  const rootId = id ?? `flow-${autoId.replace(/[:]/g, '')}`;

  // The answer key, as the engine wants it: the correct option index per step.
  const correct = steps.map((s) => {
    const at = (s.options ?? []).findIndex((o) => o.correct);
    return at >= 0 ? at : undefined;
  });

  const flow = useStepFlow({ count, mode, correct, onStepChange });

  if (count === 0) return null;

  const { current, atResult, answers, score } = flow;
  const isLast = current === count - 1;
  const forwardLabel = nextLabel ?? (mode === 'quiz' && isLast ? 'See result' : 'Next');

  return (
    <StepFlowRoot flow={flow} id={rootId} className={cn('flex flex-col gap-6', className)}>
      {progress === 'dots' ? (
        // An ordered list with `aria-current="step"` — the one ARIA pattern that
        // is actually specified for "where am I in a sequence", and it needs no
        // role invention. Unhydrated it points at step 1, which is true: that is
        // where the outline starts. Chrome, not the progress primitive: the dots
        // are this wrapper's look, and the primitive is a render prop for a
        // design's own counter words.
        <ol data-slot="step-flow-progress" className="flex flex-wrap items-center gap-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                aria-current={i === current && !atResult ? 'step' : undefined}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border text-xs font-medium tabular-nums',
                  i === current && !atResult
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[i] !== undefined
                      ? 'border-primary text-primary'
                      : 'text-muted-foreground',
                )}
              >
                {i + 1}
                {/* The step's name, for a screen reader walking the list — the
                    number alone is meaningless out of visual context. */}
                <span className="sr-only"> {s.title}</span>
              </span>
              {i < count - 1 ? <span aria-hidden className="h-px w-4 bg-border" /> : null}
            </li>
          ))}
        </ol>
      ) : null}

      {progress === 'bar' ? (
        <div
          data-slot="step-flow-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={count}
          aria-valuenow={atResult ? count : current + 1}
          aria-valuetext={atResult ? 'Complete' : `Step ${current + 1} of ${count}`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
            style={{ width: `${(((atResult ? count : current + 1) / count) * 100).toFixed(2)}%` }}
          />
        </div>
      ) : null}

      {steps.map((s, i) => {
        const picked = answers[i];
        const pickedOption = picked !== undefined ? s.options?.[picked] : undefined;
        const titleId = `${rootId}-step-${i + 1}-title`;
        return (
          <StepFlowPanel
            key={i}
            index={i}
            aria-labelledby={titleId}
            className={cn('flex flex-col gap-4 outline-none', panelClassName)}
          >
            {s.kicker ? (
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{s.kicker}</p>
            ) : null}

            {s.options && s.options.length > 0 && mode === 'quiz' ? (
              <fieldset
                // `min-w-0`: a fieldset's default `min-width: min-content` is one
                // of the few elements that ignores a flex/grid parent's shrink,
                // and a long option label then pushes the whole document sideways
                // at 360. Kept as this wrapper's own structure (legend semantics
                // for free); the LOCK is the engine's per-input `disabled` — this
                // `disabled` mirrors it so the whole group reads locked at once.
                className="min-w-0 border-0 p-0"
                disabled={picked !== undefined}
              >
                <legend id={titleId} className="text-xl font-semibold tracking-tight md:text-2xl">
                  {s.title}
                </legend>
                {s.body ? <p className="mt-2 text-muted-foreground">{s.body}</p> : null}
                <div className="mt-4 flex flex-col gap-2">
                  {s.options.map((option, oi) => {
                    const state = flow.verdict(i, oi);
                    return (
                      // The option primitive IS the row: one label, the whole
                      // surface tappable, `data-state` as the styling hook, and
                      // the verdict-in-words handled inside it (aria-labelledby
                      // keeps the radio's name from changing when answered).
                      <StepFlowOption
                        key={oi}
                        index={i}
                        option={oi}
                        asChild
                        inputClassName="size-4 shrink-0 accent-current"
                      >
                        <div
                          className={cn(
                            'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border py-2.5 pl-4 pr-4 text-left text-sm',
                            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                            picked === undefined && 'hover:bg-accent hover:text-accent-foreground',
                            // The verdict is carried three ways — colour, a fill,
                            // and a glyph — because no single one survives every
                            // kit. `primary` vs `destructive` is the only token
                            // pair guaranteed to EXIST, but nothing guarantees
                            // they differ: a kit whose brand colour is red draws
                            // both verdicts in near-identical crimson (seen, not
                            // hypothesised). The tint separates them there, and
                            // the glyph carries it for anyone colour cannot serve.
                            'data-[state=correct]:border-primary data-[state=correct]:text-primary data-[state=correct]:bg-primary/10',
                            'data-[state=wrong]:border-destructive data-[state=wrong]:text-destructive',
                            picked !== undefined && !state && 'text-muted-foreground',
                          )}
                        >
                          <span className="min-w-0 flex-1">{option.label}</span>
                          {state ? (
                            <span aria-hidden className="shrink-0 font-semibold">
                              {state === 'correct' ? '✓' : '✕'}
                            </span>
                          ) : null}
                        </div>
                      </StepFlowOption>
                    );
                  })}
                </div>
                {pickedOption?.feedback ? (
                  // `role="status"` so the explanation is announced when it
                  // appears; it arrives in response to the reader's own click, so
                  // polite is right and an alert would be rude.
                  <p role="status" className="mt-3 text-sm text-muted-foreground">
                    {pickedOption.feedback}
                  </p>
                ) : null}
              </fieldset>
            ) : (
              <>
                <h3 id={titleId} className="text-xl font-semibold tracking-tight md:text-2xl">
                  {s.title}
                </h3>
                {authored[i] ?? <DataPanel step={s} />}
              </>
            )}
          </StepFlowPanel>
        );
      })}

      {atResult ? (
        <StepFlowResult
          aria-labelledby={`${rootId}-result-title`}
          className={cn(
            'flex flex-col gap-3 rounded-lg border bg-card p-6 text-card-foreground',
            panelClassName,
          )}
        >
          <h3 id={`${rootId}-result-title`} className="text-xl font-semibold tracking-tight">
            {resultTitle}
          </h3>
          <p className="text-3xl font-semibold tabular-nums">
            {score} <span className="text-muted-foreground">of {count}</span>
          </p>
          {resultBody ? <p className="text-muted-foreground">{resultBody}</p> : null}
        </StepFlowResult>
      ) : null}

      {/* The controls, rendered whether or not this has hydrated — and `inert`
          until it has.

          Rendering them either way is deliberate twice over. It keeps the two
          renders' TEXT identical, so "does anything disappear without JS" stays a
          comparison you can make without knowing the props. And `inert` is the
          truthful state of a control whose handler has not arrived: no tab stop,
          not in the accessibility tree, rather than a button that looks live and
          swallows the press. */}
      <div
        data-slot="step-flow-nav"
        inert={!flow.interactive}
        className="flex flex-wrap items-center gap-3"
      >
        {atResult ? (
          <button
            type="button"
            onClick={flow.restart}
            className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {restartLabel}
          </button>
        ) : (
          <>
            <StepFlowBack asChild>
              <button className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                {backLabel}
              </button>
            </StepFlowBack>
            <StepFlowNext asChild>
              <button className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                {forwardLabel}
              </button>
            </StepFlowNext>
          </>
        )}
        {/* The visible counter IS the live region — the progress primitive's
            whole job. */}
        <StepFlowProgress className="text-sm text-muted-foreground">
          {() => (atResult ? 'Complete' : `Step ${current + 1} of ${count}`)}
        </StepFlowProgress>
      </div>
    </StepFlowRoot>
  );
}

export const StepFlowShowcase = [
  {
    label: 'Stepper — three steps',
    props: {
      className: 'max-w-2xl',
      steps: [
        {
          kicker: 'Step one',
          title: 'Connect your design system',
          body: 'Point Kopla at a Figma file. It reads the tokens, the type styles and the component set, and keeps them as the source of truth.',
        },
        {
          kicker: 'Step two',
          title: 'Describe the page',
          body: 'Say what the page is for and who it is for. Kopla writes the narrative and lays it out with your own sections.',
        },
        {
          kicker: 'Step three',
          title: 'Publish it',
          body: 'Review, adjust the copy, and publish to your own domain. The page ships as static HTML.',
        },
      ],
    },
  },
  {
    // Longhand on purpose. `Array.from(...)` reads better and is WRONG here:
    // extract-design.mjs reads static literals only, so a generated case is
    // skipped entirely — it would still render in the component lab (which
    // imports the real module) while being absent from design.json.
    label: 'Stepper — ten steps',
    props: {
      className: 'max-w-2xl',
      steps: [
        { title: 'Stage one', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage two', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage three', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage four', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage five', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage six', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage seven', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage eight', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage nine', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage ten', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    label: 'Stepper — long titles, no body',
    props: {
      className: 'max-w-2xl',
      progress: 'none',
      steps: [
        {
          title:
            'A deliberately overlong step heading that has to wrap onto several lines without pushing anything out of the panel',
        },
        { title: 'Short one' },
        { title: 'Another perfectly ordinary heading for a step in a flow' },
      ],
    },
  },
  {
    label: 'Stepper — image on one step only',
    props: {
      className: 'max-w-2xl',
      steps: [
        {
          title: 'With a picture',
          body: 'This step has an image beside its copy.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60',
        },
        { title: 'Without a picture', body: 'This one does not, and must not collapse.' },
      ],
    },
  },
  {
    label: 'Quiz — four questions',
    props: {
      className: 'max-w-2xl',
      mode: 'quiz',
      resultTitle: 'How well do you know your own system?',
      resultBody: 'Every answer above stays visible — scroll back through to read the reasoning.',
      steps: [
        {
          title: 'Where should a brand colour live?',
          body: 'One place makes it changeable everywhere.',
          options: [
            { label: 'In a design token', correct: true, feedback: 'Right — one declaration, every surface.' },
            { label: 'On each component', feedback: 'That is the version you have to change forty times.' },
            { label: 'In the page background', feedback: 'A background is a use of the colour, not the colour.' },
          ],
        },
        {
          title: 'What ships on a page with no interactive parts?',
          options: [
            { label: 'HTML and CSS', correct: true, feedback: 'Correct — nothing to hydrate, nothing to download.' },
            { label: 'HTML, CSS and a framework runtime', feedback: 'Only when something on the page needs the browser.' },
          ],
        },
        {
          title: 'An accordion with one panel open at a time is…',
          options: [
            { label: 'A native <details name> group', correct: true, feedback: 'The shared name is what makes it exclusive.' },
            { label: 'A click handler and some state', feedback: 'It works, and it costs you the whole page going dynamic.' },
            { label: 'A grid with overflow hidden', feedback: 'Now nobody can open the second one.' },
          ],
        },
        {
          title: 'Who decides what a component looks like?',
          options: [
            { label: 'The design system', correct: true, feedback: 'Tokens in, look out. The component owns behaviour.' },
            { label: 'The component', feedback: 'Then it looks the same in every brand, which is the bug.' },
          ],
        },
      ],
    },
  },
  {
    label: 'Quiz — two questions, bar',
    props: {
      className: 'max-w-2xl',
      mode: 'quiz',
      progress: 'bar',
      resultTitle: 'Score',
      steps: [
        {
          title: 'Does a CSS-only carousel auto-advance?',
          options: [
            { label: 'No', correct: true, feedback: 'Scroll-snap scrolls. Advancing on a timer needs a timer.' },
            { label: 'Yes', feedback: 'It snaps where you scroll it — nothing moves on its own.' },
          ],
        },
        {
          title: 'Which element announces its own expanded state?',
          options: [
            { label: '<summary>', correct: true, feedback: 'So aria-expanded on it is redundant.' },
            { label: '<div role="button">', feedback: 'That one you have to wire up yourself, correctly, forever.' },
          ],
        },
      ],
    },
  },
  {
    label: 'Quiz — long options, no feedback',
    props: {
      className: 'max-w-2xl',
      mode: 'quiz',
      steps: [
        {
          title: 'Which of these is a behaviour rather than a look?',
          options: [
            {
              label:
                'A deliberately overlong answer that has to wrap onto several lines inside its own row without pushing the document sideways at 360 pixels',
              correct: true,
            },
            { label: 'Short' },
          ],
        },
        {
          title: 'And once more, with no explanation offered either way',
          options: [{ label: 'Fine' }, { label: 'Also fine', correct: true }],
        },
      ],
    },
  },
];
