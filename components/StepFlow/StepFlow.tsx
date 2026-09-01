// One panel at a time, with progress and next/back — and, in `quiz` mode, an
// answer check per step and a score at the end. THIS FILE HAS NO LOOK IN IT,
// and that is the contract, not an accident of how it was written:
//
//   1. useStepFlow        the ENGINE: which step is showing, locking an answer
//                         once given, the score, when answering itself advances
//                         the flow, where focus goes. No JSX, no classNames.
//   2. StepFlow*          SLOT PRIMITIVES: minimal elements carrying only what
//                         the mechanics and accessibility need — the radio
//                         group, the verdict, the first-paint collapse, the
//                         focus move. Styled by the AUTHOR; `asChild` makes the
//                         design's own answer card the control.
//
// The only classes in here are ones that ARE mechanics — `sr-only` on the radio
// an answer card hides, and on the label a screen reader still needs — so if you
// find yourself adding a colour, a radius or a counter's wording here, it
// belongs in the section. Start from `skeleton.quiz.tsx` or
// `skeleton.stepper.tsx` beside this file and reshape their markup freely.
//
// The styled <StepFlow> lives in `StepFlow.demo.tsx`, which is the lab's demo
// and is NOT copied into a workspace. It used to be a third layer in this file,
// and its scaffold — a vertical option list, a step counter, an invented Next —
// was copied over a design that drew none of those. That is the failure the
// separation exists to make impossible: anything true of EVERY design with a
// stepped flow in it belongs here, and everything else belongs there.
//
// Two modes on one axis, because they are the same machine:
//
//   stepper — walk forward and back through the steps. A how-it-works section,
//             an onboarding flow, a guided explainer.
//   quiz    — every step is a question. Picking an answer locks that step, shows
//             the option's feedback, and counts toward a result panel at the end.
//
// THE UNSPOKEN RULE IS STRUCTURAL: what the author MOUNTED decides how the flow
// advances. Mount a `StepFlowNext` and answering only selects — Next advances.
// Mount NO Next and `answer()` advances the flow itself, after a short feedback
// beat so the verdict is still seen. Those are exactly the two quiz designs that
// exist in the wild, told apart by the markup rather than by a prop nobody
// remembers to set (`advanceOnAnswer` remains as the explicit override). This
// encodes the reachability rule — every state stays reachable using only the
// controls the design drew — as component behaviour.
//
// Every step's markup is in the document the whole time; which panels PAINT is
// decided in CSS by `@media (scripting: enabled)`, and that one media query is
// what reconciles the two first-render truths:
//
//   * Scripts disabled or unavailable — the state a published page ships when
//     the section using this forgot `@hydrate` — the query never matches, and
//     the flow reads as one outline, every step visible in document order.
//     Nothing is lost; it simply is not a flow.
//   * Scripts enabled — the query matches at FIRST PAINT, before React has
//     hydrated anything, so only the active panel is ever visible: no flash of
//     every question stacked up, no layout shift when hydration lands. CSS
//     knows scripts WILL run before a single line of them has.
//
// (A browser too old for the `scripting` media feature ignores the block and
// gets the previous behaviour — outline first, collapsing at hydration.)
// After hydration the `hidden` attribute takes over panel visibility, and the
// two mechanisms agree by construction: both key off the current step.
//
// Keyboard: the controls are real `<button>`s and the answers are real radios, so
// the whole map is the platform's — Tab to the controls, Enter/Space to activate,
// and arrow keys move within an answer group. Nothing here rebinds a key.

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────────
 * asChild plumbing (kept file-local: this is a copy-in component, and the next
 * fork must not depend on a sibling that wasn't copied with it)
 * ──────────────────────────────────────────────────────────────────────────── */

type AnyProps = Record<string, unknown>;

function composeRefs(...refs: (Ref<unknown> | undefined)[]): (node: unknown) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as { current: unknown }).current = node;
    }
  };
}

/** Merge the primitive's mechanics props with the author's own.
 *
 *  The author wins on plain attributes, classNames and styles concatenate, and
 *  handlers COMPOSE — the author's runs first, and `preventDefault` in it
 *  cancels ours. */
function mergeSlotProps(ours: AnyProps, child: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...child };
  for (const key of Object.keys(ours)) {
    const ourValue = ours[key];
    const childValue = child[key];
    if (/^on[A-Z]/.test(key) && typeof ourValue === 'function') {
      merged[key] =
        typeof childValue === 'function'
          ? (event: { defaultPrevented?: boolean }) => {
              (childValue as (e: unknown) => void)(event);
              if (!event?.defaultPrevented) (ourValue as (e: unknown) => void)(event);
            }
          : ourValue;
    } else if (key === 'className') {
      merged.className = cn(ourValue as string, childValue as string);
    } else if (key === 'style') {
      merged.style = { ...(ourValue as CSSProperties), ...(childValue as CSSProperties) };
    } else if (childValue === undefined) {
      merged[key] = ourValue;
    }
  }
  return merged;
}

/** Render the primitive as its default tag, or — `asChild` — AS the author's own
 *  element, mechanics merged into it. Radix's contract: exactly one element. */
function renderSlot(
  asChild: boolean | undefined,
  tag: 'div' | 'button' | 'p',
  ours: AnyProps,
  children: ReactNode,
): ReactElement {
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) throw new Error('asChild expects a single element child');
    const childProps = child.props as AnyProps;
    const merged = mergeSlotProps(ours, childProps);
    merged.ref = composeRefs(ours.ref as Ref<unknown> | undefined, childProps.ref as Ref<unknown> | undefined);
    return cloneElement(child, merged);
  }
  const Tag = tag;
  return <Tag {...(ours as HTMLAttributes<HTMLElement>)}>{children}</Tag>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Layer 1 — the engine
 * ──────────────────────────────────────────────────────────────────────────── */

export interface UseStepFlowOptions {
  /** How many steps the flow has. */
  count: number;
  /** `stepper` walks; `quiz` checks an answer per step and ends on a result. */
  mode?: 'stepper' | 'quiz';
  /** Quiz only: the correct option index per step, aligned with the steps.
   *  `undefined` for a step means no option is marked correct. */
  correct?: readonly (number | undefined)[];
  /**
   * Explicit override of the structural rule. Normally UNSET: when no
   * `StepFlowNext` is mounted, `answer()` advances the flow itself; when one is
   * mounted, answering only selects and Next advances. Set this only for the
   * rare design that breaks that convention.
   */
  advanceOnAnswer?: boolean;
  /** Quiz only: does this option have a verdict worth pausing on? Advancing on
   *  answer waits `feedbackBeatMs` when true (the default), so the reader sees
   *  the verdict before the panel leaves. Return false to advance immediately. */
  hasFeedback?: (step: number, option: number) => boolean;
  /** The feedback beat, in ms. Default 900 — long enough to register a verdict,
   *  short enough not to read as a stall. */
  feedbackBeatMs?: number;
  /** Fires with the new step index whenever the flow moves. */
  onStepChange?: (index: number) => void;
}

/** What `useStepFlow` returns: mechanics only, no markup. Wire it to the
 *  design's own elements through the StepFlow* primitives. */
export interface StepFlowEngine {
  count: number;
  mode: 'stepper' | 'quiz';
  /** The raw position. `count` means the result panel (quiz only). */
  step: number;
  /** The position clamped to the last real step — what panels compare against. */
  current: number;
  atResult: boolean;
  /** False until hydration lands: the outline state, where every panel is
   *  visible and nav must be inert. */
  interactive: boolean;
  /** Picked option per step index. Keyed by index rather than an array so a
   *  step list that grew or shrank cannot leave a stale slot behind. */
  answers: Record<number, number>;
  picked: (step: number) => number | undefined;
  /** The verdict an answered option wears: the correct option reads `correct`
   *  even when the reader missed it; the reader's own wrong pick reads `wrong`. */
  verdict: (step: number, option: number) => 'correct' | 'wrong' | undefined;
  /** Lock in an answer. Locked once given: a quiz whose answer can be changed
   *  after the feedback appears is a quiz with a free retry, and its score means
   *  nothing. May advance the flow itself — see the structural rule above. */
  answer: (step: number, option: number) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
  /** Whether the forward control has anywhere to go: a quiz can only advance
   *  once the question is answered; a stepper dead-ends at the last step. */
  canNext: boolean;
  score: number;
  /** Bumped on every reader-caused move; the panel primitives consume it to move
   *  focus to the panel that replaced the one the reader was on. */
  focusSeq: number;
  /** StepFlowNext calls this; returns the unregister. While anything is
   *  registered, `answer()` only selects. */
  registerNext: () => () => void;
}

export function useStepFlow({
  count,
  mode = 'stepper',
  correct,
  advanceOnAnswer,
  hasFeedback,
  feedbackBeatMs = 900,
  onStepChange,
}: UseStepFlowOptions): StepFlowEngine {
  // The hydration gate. Until it flips every panel is visible and the flow is an
  // outline — see the header note on why that is the degraded render we want.
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);

  // `count` means the result panel, which only a quiz has.
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  // Mirrored in a ref so `answer()` can check the lock the moment it is called —
  // two taps in one frame must not both take.
  const answersRef = useRef<Record<number, number>>({});

  // Focus moves to the panel when the step changes, and NOT on first paint —
  // pressing Next otherwise leaves focus on a button whose panel has been
  // replaced underneath it, which is a keyboard user reading nothing. The seq
  // starts at 0 = "never moved"; the panel primitives skip that value.
  const [focusSeq, setFocusSeq] = useState(0);

  // The advance-on-answer timer — clears on any explicit move, and on unmount.
  const pendingRef = useRef(0);
  useEffect(() => () => window.clearTimeout(pendingRef.current), []);

  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  const hasFeedbackRef = useRef(hasFeedback);
  hasFeedbackRef.current = hasFeedback;

  const go = useCallback(
    (target: number) => {
      window.clearTimeout(pendingRef.current);
      const limit = mode === 'quiz' ? count : count - 1;
      const clamped = Math.max(0, Math.min(target, limit));
      if (clamped === stepRef.current) return;
      stepRef.current = clamped;
      setStep(clamped);
      setFocusSeq((s) => s + 1);
      onStepChangeRef.current?.(clamped);
    },
    [count, mode],
  );

  // The StepFlowNext roster. A ref, because `answer()` reads it at event time
  // and a child's mount effect has already run by the time anything can click.
  const nextControls = useRef(0);
  const registerNext = useCallback(() => {
    nextControls.current += 1;
    return () => {
      nextControls.current -= 1;
    };
  }, []);

  const answer = useCallback(
    (stepIndex: number, optionIndex: number) => {
      // Locked once given.
      if (answersRef.current[stepIndex] !== undefined) return;
      answersRef.current = { ...answersRef.current, [stepIndex]: optionIndex };
      setAnswers(answersRef.current);
      if (mode !== 'quiz') return;
      // The structural rule: no mounted Next ⇒ answering advances. Decided from
      // what is mounted RIGHT NOW, so a design that only draws Next on some
      // steps gets the right behaviour on each.
      const auto = advanceOnAnswer ?? nextControls.current === 0;
      if (!auto || stepIndex !== stepRef.current) return;
      const beat = (hasFeedbackRef.current?.(stepIndex, optionIndex) ?? true) ? feedbackBeatMs : 0;
      window.clearTimeout(pendingRef.current);
      pendingRef.current = window.setTimeout(() => go(stepIndex + 1), beat);
    },
    [mode, advanceOnAnswer, feedbackBeatMs, go],
  );

  const next = useCallback(() => go(stepRef.current + 1), [go]);
  const back = useCallback(() => go(stepRef.current - 1), [go]);

  const restart = useCallback(() => {
    window.clearTimeout(pendingRef.current);
    answersRef.current = {};
    setAnswers({});
    stepRef.current = 0;
    setStep(0);
    setFocusSeq((s) => s + 1);
    onStepChangeRef.current?.(0);
  }, []);

  const atResult = mode === 'quiz' && step >= count;
  const current = Math.min(step, Math.max(count - 1, 0));

  let score = 0;
  for (let i = 0; i < count; i += 1) {
    const picked = answers[i];
    if (picked !== undefined && correct?.[i] === picked) score += 1;
  }

  return {
    count,
    mode,
    step,
    current,
    atResult,
    interactive,
    answers,
    picked: (i: number) => answers[i],
    verdict: (i: number, oi: number) => {
      if (answers[i] === undefined) return undefined;
      if (correct?.[i] === oi) return 'correct';
      if (answers[i] === oi) return 'wrong';
      return undefined;
    },
    answer,
    next,
    back,
    restart,
    // A quiz can only advance once the question is answered; a stepper dead-ends
    // at the last step rather than wrapping — a flow is a sequence, and wrapping
    // would tell the reader they had not finished.
    canNext: mode === 'quiz' ? answers[current] !== undefined && !atResult : current < count - 1,
    score,
    focusSeq,
    registerNext,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Layer 2 — slot primitives
 *
 * Each carries ONLY what the mechanics and accessibility need. Looks are the
 * author's: style them via className/children and the data- attributes
 * (`data-active` on the current panel, `data-state="correct|wrong"` on an
 * answered option) — never by editing baked classes, because there are none.
 *
 * The no-JS obligation is structural here: every panel is ALWAYS in the markup
 * (visibility is `data-active` + `hidden`, never conditional rendering), so a
 * page that never hydrates still reads as one complete outline.
 * ──────────────────────────────────────────────────────────────────────────── */

interface StepFlowContextValue {
  flow: StepFlowEngine;
  id: string;
}

const StepFlowContext = createContext<StepFlowContextValue | null>(null);

function useStepFlowContext(where: string): StepFlowContextValue {
  const ctx = useContext(StepFlowContext);
  if (!ctx) throw new Error(`${where} must be rendered inside a StepFlowRoot`);
  return ctx;
}

export interface StepFlowRootProps extends HTMLAttributes<HTMLElement> {
  /** The engine, from `useStepFlow`. */
  flow: StepFlowEngine;
  /** Id root: each panel gets `<id>-step-<n>`, and each step's radio group is
   *  named from it. */
  id?: string;
  asChild?: boolean;
  children?: ReactNode;
}

/** The flow's container: context for every other primitive, plus the
 *  scripting-gated first-paint collapse. That `<style>` is what stops every
 *  question stacking up for a beat before hydration — CSS knows scripts WILL
 *  run before a single line of them has. Generic on purpose: every flow on a
 *  page ships the identical rule, which the cascade dedupes for free. */
export function StepFlowRoot({ flow, id, asChild, children, ...rest }: StepFlowRootProps) {
  const autoId = useId();
  const rootId = id ?? `flow-${autoId.replace(/[:]/g, '')}`;
  const ours: AnyProps = {
    'data-slot': 'step-flow',
    'data-mode': flow.mode,
    ...rest,
  };
  const collapse = (
    <style>{`@media (scripting: enabled){[data-slot="step-flow-panel"]:not([data-active]){display:none}}`}</style>
  );
  let body: ReactElement;
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) throw new Error('StepFlowRoot asChild expects a single element child');
    const childProps = child.props as AnyProps;
    const merged = mergeSlotProps(ours, childProps);
    merged.ref = composeRefs(ours.ref as Ref<unknown> | undefined, childProps.ref as Ref<unknown> | undefined);
    body = cloneElement(
      child,
      merged,
      <>
        {collapse}
        {(childProps as { children?: ReactNode }).children}
      </>,
    );
  } else {
    body = (
      <div {...(ours as HTMLAttributes<HTMLDivElement>)}>
        {collapse}
        {children}
      </div>
    );
  }
  return <StepFlowContext.Provider value={{ flow, id: rootId }}>{body}</StepFlowContext.Provider>;
}

/** What the progress render prop sees. Data, not chrome: the author writes the
 *  design's own counter words over it. */
export interface StepFlowProgressState {
  /** The clamped current step, 0-based. */
  step: number;
  count: number;
  atResult: boolean;
  score: number;
  answers: Record<number, number>;
}

export interface StepFlowProgressProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  asChild?: boolean;
  /** A render prop over the flow's position — `({ step, count }) =>
   *  <>Question {step + 1} / {count}</>` — or plain children. */
  children?: ReactNode | ((state: StepFlowProgressState) => ReactNode);
}

/** The design's own counter, made the live region: one string, announced when it
 *  changes and readable at any time, instead of a drawn counter plus an sr-only
 *  twin saying the same thing. */
export function StepFlowProgress({ asChild, children, ...rest }: StepFlowProgressProps) {
  const { flow } = useStepFlowContext('StepFlowProgress');
  const content =
    typeof children === 'function'
      ? children({
          step: flow.current,
          count: flow.count,
          atResult: flow.atResult,
          score: flow.score,
          answers: flow.answers,
        })
      : children;
  const ours: AnyProps = {
    'data-slot': 'step-flow-progress',
    'aria-live': 'polite',
    'aria-atomic': true,
    ...rest,
  };
  return renderSlot(asChild, 'p', ours, content);
}

export interface StepFlowPanelProps extends HTMLAttributes<HTMLElement> {
  /** Position in the flow, 0-based. Must match document order. */
  index: number;
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * One step's panel. Always in the markup — `data-active` is set from the SERVER
 * on the current panel (it is what the scripting-gated CSS keys the first paint
 * on, so it must not wait for hydration), and `hidden` takes over once hydrated.
 * Takes focus when it replaces the panel the reader was on.
 */
export function StepFlowPanel({ index, asChild, children, ...rest }: StepFlowPanelProps) {
  const { flow, id } = useStepFlowContext('StepFlowPanel');
  const isCurrent = index === flow.current && !flow.atResult;
  const ref = useRef<HTMLElement | null>(null);
  const consumed = useRef(0);
  useEffect(() => {
    if (flow.focusSeq === 0 || flow.focusSeq === consumed.current || !isCurrent) return;
    consumed.current = flow.focusSeq;
    // `preventScroll`: the flow may sit mid-page, and yanking the viewport to it
    // on every Next is worse than the focus being slightly off-screen.
    ref.current?.focus({ preventScroll: true });
  }, [flow.focusSeq, isCurrent]);
  const ours: AnyProps = {
    id: `${id}-step-${index + 1}`,
    'data-slot': 'step-flow-panel',
    // Set from the SERVER — see the component header.
    'data-active': isCurrent ? '' : undefined,
    // `hidden` only once hydrated. The attribute alone is enough — Tailwind's
    // preflight backs `[hidden]` with `display: none !important`, so it beats
    // any author display. (Which is also why a panel must never set `display`
    // via inline style: an inline display would beat the scripting-gated
    // collapse above and stack every panel on first paint.)
    hidden: flow.interactive && !isCurrent ? true : undefined,
    // Only the panel that is showing takes focus, and only once there is more
    // than one panel to be showing — an outline of every step needs no tab stop.
    tabIndex: flow.interactive && isCurrent ? -1 : undefined,
    role: flow.interactive && isCurrent ? 'group' : undefined,
    ref,
    ...rest,
  };
  return renderSlot(asChild, 'div', ours, children);
}

export interface StepFlowOptionProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Which step this option answers, 0-based. */
  index: number;
  /** Which option it is, 0-based within the step. */
  option: number;
  asChild?: boolean;
  /** Classes for the radio input itself. Defaults to `sr-only` — the author's
   *  markup IS the visible control; pass something visible to draw a native
   *  radio instead. */
  inputClassName?: string;
  children?: ReactNode;
}

/**
 * One answer, as a real radio. Always a `<label>` wrapping an
 * `<input type="radio">` — group semantics, keyboard and the 44px surface come
 * from the platform — and with `asChild` the label WEARS the author's element:
 * its className, style and children move onto the label, so the design's card
 * is the whole tap target.
 *
 * The verdict is exposed two ways, and where each lives is not a detail:
 * `data-state="correct|wrong"` on the label (the styling hook), and an sr-only
 * verdict in words beside the content. The radio is named via
 * `aria-labelledby` pointing at the content alone, because a label's text is
 * otherwise the input's accessible name — and a control whose name changes from
 * "No" to "No, correct answer" the moment it is answered is the kind of thing
 * that reads fine and tests false.
 *
 * Locking is per-input `disabled` driven by the engine — the platform refuses
 * the change, rather than a handler politely ignoring it. (Not a
 * `fieldset[disabled]`: a fieldset cannot be a flex/grid container in every
 * browser a customer's page must work in, and the panel is where the author's
 * layout lives.)
 */
export function StepFlowOption({
  index,
  option,
  asChild,
  inputClassName,
  children,
  ...rest
}: StepFlowOptionProps) {
  const { flow, id } = useStepFlowContext('StepFlowOption');
  const state = flow.verdict(index, option);
  const picked = flow.picked(index) === option;
  const locked = flow.picked(index) !== undefined;
  const contentId = useId();

  let labelProps: AnyProps = {
    'data-slot': 'step-flow-option',
    'data-state': state,
    ...rest,
  };
  let content: ReactNode = children;
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) throw new Error('StepFlowOption asChild expects a single element child');
    const { children: childChildren, ...childRest } = child.props as AnyProps & {
      children?: ReactNode;
    };
    labelProps = mergeSlotProps(labelProps, childRest);
    content = childChildren;
  }

  return (
    <label {...(labelProps as LabelHTMLAttributes<HTMLLabelElement>)}>
      <input
        type="radio"
        className={inputClassName ?? 'sr-only'}
        name={`${id}-step-${index + 1}`}
        value={option}
        checked={picked}
        disabled={locked}
        onChange={() => flow.answer(index, option)}
        aria-labelledby={contentId}
      />
      {/* `display: contents`, so the author's children lay out as if they were
          the label's own — a grid card stays a grid card. */}
      <span id={contentId} style={{ display: 'contents' }}>
        {content}
      </span>
      {state ? (
        // The verdict in words, because a tick is not text — and outside the
        // radio's accessible name by construction (see above).
        <span className="sr-only">
          {state === 'correct' ? 'Correct answer' : 'Your answer, incorrect'}
        </span>
      ) : null}
    </label>
  );
}

export interface StepFlowNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}

/** The backward control. Disabled at the first step — a flow dead-ends rather
 *  than wrapping. Inert until hydration, honestly dead rather than fake-alive. */
export function StepFlowBack({ asChild, children, ...rest }: StepFlowNavButtonProps) {
  const { flow } = useStepFlowContext('StepFlowBack');
  const ours: AnyProps = {
    'data-slot': 'step-flow-back',
    disabled: flow.step === 0 ? true : undefined,
    inert: flow.interactive ? undefined : true,
    onClick: flow.back,
    ...(asChild ? {} : { type: 'button' }),
    ...rest,
  };
  return renderSlot(asChild, 'button', ours, children);
}

/** The forward control. MOUNTING one is a statement: answering then only
 *  selects, and this advances (unmount it and `answer()` advances the flow
 *  itself — the structural rule in the header). Disabled until it has somewhere
 *  to go; hidden at the result, where there is no forward. */
export function StepFlowNext({ asChild, children, ...rest }: StepFlowNavButtonProps) {
  const { flow } = useStepFlowContext('StepFlowNext');
  useEffect(() => flow.registerNext(), [flow.registerNext]);
  const ours: AnyProps = {
    'data-slot': 'step-flow-next',
    disabled: flow.canNext ? undefined : true,
    hidden: flow.atResult ? true : undefined,
    inert: flow.interactive ? undefined : true,
    onClick: flow.next,
    ...(asChild ? {} : { type: 'button' }),
    ...rest,
  };
  return renderSlot(asChild, 'button', ours, children);
}

/** What the result render prop sees. */
export interface StepFlowResultState {
  score: number;
  count: number;
  answers: Record<number, number>;
  restart: () => void;
}

export interface StepFlowResultProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  asChild?: boolean;
  /** A render prop over `{ score, count, answers, restart }`, or plain children. */
  children?: ReactNode | ((state: StepFlowResultState) => ReactNode);
}

/**
 * The ending. Renders only at the result, takes focus when the flow arrives.
 *
 * Two endings, told apart structurally like the Next rule: the author's own
 * markup over the render prop is a plain result; mount a native
 * `<form method="post">` inside it — capture-path action, a
 * `[data-kopla-form-success]` panel as the post-submit screen — and the result
 * IS a capture form. Put `<StepFlowAnswerFields />` inside the form and the
 * submission carries the whole response. No form mounted ⇒ nothing leaves the
 * page; the answers travel ONLY when the author mounted the form.
 */
export function StepFlowResult({ asChild, children, ...rest }: StepFlowResultProps) {
  const { flow } = useStepFlowContext('StepFlowResult');
  const ref = useRef<HTMLElement | null>(null);
  const consumed = useRef(0);
  useEffect(() => {
    if (!flow.atResult || flow.focusSeq === 0 || flow.focusSeq === consumed.current) return;
    consumed.current = flow.focusSeq;
    ref.current?.focus({ preventScroll: true });
  }, [flow.focusSeq, flow.atResult]);
  if (!flow.atResult) return null;
  const content =
    typeof children === 'function'
      ? children({ score: flow.score, count: flow.count, answers: flow.answers, restart: flow.restart })
      : children;
  const ours: AnyProps = {
    'data-slot': 'step-flow-result',
    role: 'group',
    tabIndex: -1,
    ref,
    ...rest,
  };
  return renderSlot(asChild, 'div', ours, content);
}

export interface StepFlowAnswerFieldsProps {
  /** Field-name prefix: answers post as `<prefix>1` … `<prefix>N`. The names
   *  become the capture inbox's columns. */
  prefix?: string;
  /** How an answer is written. Defaults to the option index as a string; pass
   *  `(step, option) => labels[step][option]` to post the words instead. */
  format?: (step: number, option: number) => string;
}

/** The picked answers and the score, as hidden inputs — mount inside the result
 *  form and a submission carries the whole response. Unanswered steps post
 *  nothing rather than an empty column. */
export function StepFlowAnswerFields({ prefix = 'q', format }: StepFlowAnswerFieldsProps) {
  const { flow } = useStepFlowContext('StepFlowAnswerFields');
  const fields: ReactNode[] = [];
  for (let i = 0; i < flow.count; i += 1) {
    const picked = flow.answers[i];
    if (picked === undefined) continue;
    fields.push(
      <input
        key={i}
        type="hidden"
        name={`${prefix}${i + 1}`}
        value={format ? format(i, picked) : String(picked)}
      />,
    );
  }
  return (
    <>
      {fields}
      <input type="hidden" name="score" value={String(flow.score)} />
    </>
  );
}

