'use client';

// Design-authored fixtures for the ENGINE layer — the compositions a real
// design system's agent would write, driven by the primitives instead of the
// styled wrappers. These exist because the catalog's own showcases can only
// exercise the styled components: every case is a `{ props }` literal, so
// nothing in the lab proved the layer this catalog now leads with — the
// author's own markup wearing the engine's mechanics.
//
// Each fixture is a real-world failure, kept as a fixture so it stays failed
// in history and passing in CI:
//
// - `peek-carousel`: a hand-built five-slide gallery once scrolled BACKWARDS
//   past every slide when dot 5 was pressed from slide 4 — the last-slide
//   offset math every hand-rolled track gets wrong differently. The design
//   draws numbered dots, a lone next arrow (its mirror appears only when a
//   slide is behind), and cropped neighbours.
// - `card-quiz`: a quiz whose design drew nearly everything — answers as three
//   clickable cards in a row, a Back pill, its own "Question 1 / 3" — and
//   whose implementation was hijacked by the styled StepFlow's scaffold
//   (vertical radio list, invented Next, a second counter). Here the design's
//   markup IS the quiz: no Next is mounted, so picking a card advances, and
//   the ending is a capture form carrying the answers.
//
// Styled INLINE on purpose: the lab's theme stylesheets are precompiled from
// the kit + catalog sources, so a fixture's Tailwind classes would silently
// compile to nothing — and a fixture that emulates an agent-authored section
// should ship its own styling anyway.

import {
  CarouselDot,
  CarouselNext,
  CarouselPrev,
  CarouselRoot,
  CarouselSlide,
  CarouselTrack,
  useCarousel,
} from '../../../../components/Carousel/Carousel';
import {
  StepFlowAnswerFields,
  StepFlowBack,
  StepFlowOption,
  StepFlowPanel,
  StepFlowProgress,
  StepFlowResult,
  StepFlowRoot,
  useStepFlow,
} from '../../../../components/StepFlow/StepFlow';

const SLIDES = ['One', 'Two', 'Three', 'Four', 'Five'];

function PeekCarousel() {
  const car = useCarousel({ count: SLIDES.length });
  return (
    <CarouselRoot car={car} label="Project gallery" style={{ position: 'relative', padding: '48px 0' }}>
      <style>{`
        [data-slot="carousel-track"]{scrollbar-width:none}
        [data-slot="carousel-dot"][aria-current="true"]{background:#111;color:#fff}
      `}</style>
      <CarouselTrack
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '0 14%',
        }}
      >
        {SLIDES.map((name, i) => (
          <CarouselSlide
            key={name}
            index={i}
            style={{
              minWidth: '72%',
              height: 192,
              scrollSnapAlign: 'center',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid #ddd',
              borderRadius: 16,
              background: '#fff',
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            Slide {name}
          </CarouselSlide>
        ))}
      </CarouselTrack>
      {/* The design drew ONE round arrow, centered on the right edge. Its
          mirror is mounted too and appears exactly when a slide is behind. */}
      <CarouselPrev asChild>
        <button aria-label="Previous slide" style={{ ...arrowStyle, left: 16 }}>
          ←
        </button>
      </CarouselPrev>
      <CarouselNext asChild>
        <button aria-label="Next slide" style={{ ...arrowStyle, right: 16 }}>
          →
        </button>
      </CarouselNext>
      {/* Numbered dots, as the failing design drew them. */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {SLIDES.map((name, i) => (
          <CarouselDot key={name} index={i} style={dotStyle}>
            {i + 1}
          </CarouselDot>
        ))}
      </div>
    </CarouselRoot>
  );
}

const arrowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 44,
  height: 44,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 999,
  border: '1px solid #ddd',
  background: '#fff',
};

const dotStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 999,
  border: '1px solid #ddd',
  background: '#fff',
  fontSize: 13,
};

const QUESTIONS = [
  { prompt: 'Where are you starting from?', options: ['Brand new', 'Been around', 'Leading already'] },
  { prompt: 'What are you after?', options: ['Community', 'Adventure', 'Growth'] },
];

function CardQuiz() {
  const flow = useStepFlow({
    count: QUESTIONS.length,
    mode: 'quiz',
    correct: [0, 1],
    // Fast beat so the spec doesn't spend 900ms per answer; the beat itself is
    // still exercised (the panel must NOT change synchronously with the click).
    feedbackBeatMs: 120,
  });
  return (
    <StepFlowRoot
      flow={flow}
      id="belong"
      style={{ maxWidth: 760, margin: '0 auto', padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <style>{`
        [data-slot="step-flow-option"][data-state="correct"] article{background:#111;color:#fff}
      `}</style>
      <h2 style={{ fontSize: 30, fontWeight: 900, textTransform: 'uppercase' }}>
        You belong here. Let’s find it.
      </h2>
      {QUESTIONS.map((q, step) => (
        <StepFlowPanel key={q.prompt} index={step} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>{q.prompt}</p>
          {/* The design's answers: a ROW of big clickable cards. No Next is
              mounted anywhere, so picking one advances the flow. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {q.options.map((label, option) => (
              <StepFlowOption key={label} index={step} option={option} asChild>
                <article style={cardStyle}>
                  {label} <span aria-hidden>→</span>
                </article>
              </StepFlowOption>
            ))}
          </div>
        </StepFlowPanel>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StepFlowBack asChild>
          <button style={pillStyle}>Back</button>
        </StepFlowBack>
        {/* The design's own counter words — no "Step N of M" of the widget's. */}
        <StepFlowProgress style={{ fontSize: 13, fontWeight: 500 }}>
          {({ step, count }) => <>Question {Math.min(step + 1, count)} / {count}</>}
        </StepFlowProgress>
      </div>
      <StepFlowResult style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {({ score, count, restart }) => (
          <>
            <h3 style={{ fontSize: 24, fontWeight: 700 }}>
              You scored {score} / {count}
            </h3>
            {/* The capture ending: a native form per the host's contract, the
                answers riding as hidden inputs. */}
            <form
              method="post"
              action="/__kopla/forms/belong-quiz"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Email
                <input type="email" name="email" required style={{ border: '1px solid #ddd', borderRadius: 8, padding: '10px 12px' }} />
              </label>
              <StepFlowAnswerFields />
              <button type="submit" style={{ ...pillStyle, background: '#111', color: '#fff' }}>
                See where you fit
              </button>
              <div data-kopla-form-success hidden>
                Thanks — check your inbox.
              </div>
            </form>
            <button type="button" onClick={restart} style={{ alignSelf: 'flex-start', fontSize: 13, textDecoration: 'underline' }}>
              Start over
            </button>
          </>
        )}
      </StepFlowResult>
    </StepFlowRoot>
  );
}

const cardStyle: React.CSSProperties = {
  minHeight: 112,
  cursor: 'pointer',
  borderRadius: 24,
  border: '1px solid #ddd',
  background: '#fff',
  padding: 24,
  fontWeight: 600,
};

const pillStyle: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid #ddd',
  background: '#fff',
  padding: '10px 20px',
};

// The stage: selected by name INSIDE the client module, because a server
// component cannot reach into a client module's exported object — a
// `fixtures[name]` lookup across the boundary reads undefined and 404s.
const FIXTURES: Record<string, () => React.ReactNode> = {
  'peek-carousel': PeekCarousel,
  'card-quiz': CardQuiz,
};

export function FixtureStage({ name }: { name: string }) {
  const Fixture = FIXTURES[name];
  return Fixture ? <Fixture /> : null;
}
