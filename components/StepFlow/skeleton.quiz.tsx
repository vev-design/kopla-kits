// SKELETON for `quiz` — copy this into a SECTION file and reshape.
//
// Everything visible is a PLACEHOLDER — every element, class and word below is
// yours to change to what the design draws. KEEP the hook, the primitives and
// the wiring: they carry the locking (an answered question stays answered), the
// verdicts, the first-paint collapse, focus movement and the radio semantics
// that make the design's cards real controls.
//
// Rules that survive any reshape:
// - `StepFlowOption asChild` makes the design's own card/row/chip the whole
//   answer control (a real radio underneath). Verdicts arrive as
//   `data-state="correct" | "wrong"` on the option — style them as the design
//   would.
// - Mount Back/Next ONLY where the design draws them. With no StepFlowNext
//   mounted, picking an answer IS the advance (after a beat that shows the
//   verdict) — which is what a design whose answers are clickable cards means.
// - StepFlowProgress is a render prop: use the design's OWN counter words.
// - The ENDING is a decision. Plain result: the design's markup over
//   `{ score, restart }`. Capture: mount a native form inside StepFlowResult —
//   action `/__kopla/forms/<name>`, a `[data-kopla-form-success]` panel — and
//   `<StepFlowAnswerFields />` rides the answers into the submission.
// - Keep the `@hydrate` tag, or the quiz ships dead on the published page.

import {
  StepFlowAnswerFields,
  StepFlowBack,
  StepFlowOption,
  StepFlowPanel,
  StepFlowProgress,
  StepFlowResult,
  StepFlowRoot,
  useStepFlow,
} from '@/components/StepFlow';

interface QuizSkeletonProps {
  /** @hydrate */
  title?: string;
}

// ← the design's own questions; `correct` marks the right option per step.
const QUESTIONS = [
  { prompt: 'Question one?', options: ['A', 'B', 'C'] },
  { prompt: 'Question two?', options: ['A', 'B', 'C'] },
];
const CORRECT = [0, 1];

export function QuizSkeleton({ title = 'Find your fit' }: QuizSkeletonProps) {
  const flow = useStepFlow({ count: QUESTIONS.length, mode: 'quiz', correct: CORRECT });
  return (
    <section className="py-16">
      <h2 className="mb-8 text-3xl font-semibold">{title}</h2>
      <StepFlowRoot flow={flow} id="quiz">
        {QUESTIONS.map((q, step) => (
          <StepFlowPanel key={q.prompt} index={step} className="flex flex-col gap-4">
            <p className="text-lg font-medium">{q.prompt}</p>
            {/* The design's answers — a row of cards, a list, whatever it drew. */}
            <div className="grid gap-4 md:grid-cols-3">
              {q.options.map((label, option) => (
                <StepFlowOption key={label} index={step} option={option} asChild>
                  <article className="cursor-pointer rounded-xl border p-6 data-[state=correct]:border-foreground">
                    {label}
                  </article>
                </StepFlowOption>
              ))}
            </div>
          </StepFlowPanel>
        ))}
        <div className="mt-6 flex items-center justify-between">
          {/* Only the controls the design draws: */}
          <StepFlowBack asChild>
            <button className="rounded-full border px-5 py-2">Back</button>
          </StepFlowBack>
          <StepFlowProgress className="text-sm">
            {({ step, count }) => <>Question {Math.min(step + 1, count)} / {count}</>}
          </StepFlowProgress>
        </div>
        <StepFlowResult className="flex flex-col gap-4">
          {({ score, count, restart }) => (
            <>
              {/* ← the design's result screen */}
              <h3 className="text-2xl font-semibold">
                {score} / {count}
              </h3>
              {/* CAPTURE ending (delete if the result stays on the page):
              <form method="post" action="/__kopla/forms/quiz" className="flex flex-col gap-3">
                <input type="email" name="email" required />
                <StepFlowAnswerFields />
                <button type="submit">Send</button>
                <div data-kopla-form-success hidden>Thanks!</div>
              </form> */}
              <button type="button" onClick={restart} className="self-start text-sm underline">
                Start over
              </button>
            </>
          )}
        </StepFlowResult>
      </StepFlowRoot>
    </section>
  );
}
