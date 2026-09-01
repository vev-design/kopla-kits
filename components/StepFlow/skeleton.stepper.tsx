// SKELETON for `stepper` — copy this into a SECTION file and reshape.
//
// Same contract as skeleton.quiz.tsx (read its header): markup is yours, the
// hook and primitives are the engine. The stepper delta: no options, no
// verdicts, no result — the reader walks panels, and the design's own
// navigation drives it. A stepper's frame usually DOES draw a forward control;
// mount StepFlowNext only because and where it does. A stepper whose panels
// advance by clicking the content itself simply mounts no Next, same
// convention as the quiz.

import {
  StepFlowBack,
  StepFlowNext,
  StepFlowPanel,
  StepFlowProgress,
  StepFlowRoot,
  useStepFlow,
} from '@/components/StepFlow';

interface StepperSkeletonProps {
  /** @hydrate */
  title?: string;
}

const STEPS = ['One', 'Two', 'Three']; // ← the design's own steps

export function StepperSkeleton({ title = 'How it works' }: StepperSkeletonProps) {
  const flow = useStepFlow({ count: STEPS.length, mode: 'stepper' });
  return (
    <section className="py-16">
      <h2 className="mb-8 text-3xl font-semibold">{title}</h2>
      <StepFlowRoot flow={flow} id="steps">
        {STEPS.map((step, i) => (
          <StepFlowPanel key={step} index={i} className="flex flex-col gap-4">
            {/* ← the design's panel markup */}
            <p className="text-lg font-medium">Step {step}</p>
          </StepFlowPanel>
        ))}
        <div className="mt-6 flex items-center justify-between">
          <StepFlowBack asChild>
            <button className="rounded-full border px-5 py-2">Back</button>
          </StepFlowBack>
          <StepFlowProgress className="text-sm">
            {({ step, count }) => <>Step {Math.min(step + 1, count)} of {count}</>}
          </StepFlowProgress>
          <StepFlowNext asChild>
            <button className="rounded-full bg-foreground px-5 py-2 text-background">Next</button>
          </StepFlowNext>
        </div>
      </StepFlowRoot>
    </section>
  );
}
