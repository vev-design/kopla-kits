// One panel at a time, with progress and next/back — and, in `quiz` mode, an
// answer check per step and a score at the end. Shipped as THREE LAYERS in one
// file, so the behaviour can be reused without inheriting a single pixel of
// look:
//
//   1. useStepFlow        the ENGINE: which step is showing, locking an answer
//                         once given, the score, when answering itself advances
//                         the flow, where focus goes. No JSX, no classNames.
//   2. StepFlow*          SLOT PRIMITIVES: minimal elements carrying only what
//                         the mechanics and accessibility need — the radio
//                         group, the verdict, the first-paint collapse, the
//                         focus move. Styled by the AUTHOR; `asChild` makes the
//                         design's own answer card the control.
//   3. StepFlow           the STYLED WRAPPER, rebuilt on layers 1–2: the lab
//                         demo, and the fallback for a design that drew no
//                         step/quiz UI of its own. When the design drew its own
//                         frame — answer cards, its own counter words, a lone
//                         Back pill — drive THAT markup with the hook + the
//                         primitives instead. Using this wrapper on such a
//                         design means shipping chrome the frame never drew.
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

/* ────────────────────────────────────────────────────────────────────────────
 * Layer 3 — the styled wrapper
 * ──────────────────────────────────────────────────────────────────────────── */

/** One answer to a `quiz` step. */
export interface StepFlowOption {
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
  options?: StepFlowOption[];
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
