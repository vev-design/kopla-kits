'use client';

// The component lab's controls and its viewport.
//
// Five controls, and each one exists because it answers a question you cannot
// answer by reading the source:
//
//   width          — a CSS transform lies to media queries, so the frame is a
//                    real iframe at a real width. 360 is where things break.
//   case           — the showcase's own states, including the adversarial ones
//                    (2 items, 10 items, a long label, a missing image). One
//                    click, rather than something you hand-build each time.
//   scripts off    — drops `allow-scripts` from the sandbox, so the frame gets
//                    the server-rendered HTML and no hydration. That IS what a
//                    published page does when its section has no `@hydrate`.
//   reduced motion — required behaviour, not a nicety.
//   theme          — the reskin check: a hardcoded radius or colour only shows
//                    up under someone else's tokens. Every theme is a
//                    precompiled stylesheet the frame links server-side, so
//                    "scripts off" and "theme" compose — the no-JS render is
//                    styled in all of them.

import { useMemo, useState } from 'react';
import './lab.css';
import type { CatalogComponent } from '../../../components.gen/manifests';
// The showcase case LABELS, read from the same registry the frame renders from
// — so the switcher can never offer a case the frame doesn't have. This is a
// client component, so importing it here is free of the server/client boundary;
// the registry imports no CSS, so no component styling leaks into the gallery.
import { registry } from '../../../components.gen/registry';

const WIDTHS = [360, 768, 1440] as const;

interface Props {
  components: CatalogComponent[];
  themes: string[];
  defaultTheme: string;
}

export default function Lab({ components, themes, defaultTheme }: Props) {
  const [dir, setDir] = useState(components[0]?.dir ?? '');
  const [width, setWidth] = useState<number>(1440);
  const [caseIndex, setCaseIndex] = useState(0);
  const [scripts, setScripts] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  const active = components.find((c) => c.dir === dir);
  const cases = (registry[dir]?.cases ?? []).map((c) => c.label);

  const src = useMemo(() => {
    const params = new URLSearchParams({ case: String(caseIndex), theme });
    if (reducedMotion) params.set('motion', 'reduce');
    return `/component/${dir}?${params.toString()}`;
  }, [dir, caseIndex, theme, reducedMotion]);

  // Remounting on every control change is deliberate: a component holding its
  // own state (a deck mid-shuffle, a quiz on question 3) must not carry that
  // state across a width or content change, or you are looking at a state the
  // new configuration never produced.
  const frameKey = `${src}|${scripts ? 'js' : 'nojs'}`;

  return (
    <div className="lab">
      <aside className="lab__list">
        <h1>Component lab</h1>
        {components.length === 0 ? (
          <p className="lab__empty">
            No components in <code>components/</code> yet.
          </p>
        ) : (
          <ul>
            {components.map((c) => (
              <li key={c.dir}>
                <button
                  type="button"
                  className={c.dir === dir ? 'is-active' : undefined}
                  onClick={() => {
                    setDir(c.dir);
                    setCaseIndex(0);
                  }}
                >
                  <span className="lab__name">{c.name}</span>
                  {c.hydrate ? <span className="lab__badge">JS</span> : null}
                  <span className="lab__desc">{c.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="lab__main">
        <div className="lab__controls">
          <div className="lab__group" role="group" aria-label="Width">
            {WIDTHS.map((w) => (
              <button
                type="button"
                key={w}
                className={w === width ? 'is-active' : undefined}
                onClick={() => setWidth(w)}
              >
                {w}
              </button>
            ))}
            <label className="lab__drag">
              <span className="lab__srOnly">Custom width</span>
              <input
                type="range"
                min={320}
                max={1600}
                step={8}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
              <output>{width}px</output>
            </label>
          </div>

          <label className="lab__field">
            <span>Content</span>
            <select
              value={caseIndex}
              onChange={(e) => setCaseIndex(Number(e.target.value))}
              disabled={cases.length === 0}
            >
              {cases.length === 0 ? (
                <option>no showcase cases</option>
              ) : (
                cases.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="lab__field">
            <span>Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {themes.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </label>

          <label className="lab__toggle">
            <input
              type="checkbox"
              checked={!scripts}
              onChange={(e) => setScripts(!e.target.checked)}
            />
            <span>Scripts off</span>
          </label>

          <label className="lab__toggle">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            <span>Reduced motion</span>
          </label>
        </div>

        {!scripts && active?.hydrate ? (
          <p className="lab__note">
            <code>{active.name}</code> declares <code>hydrate: true</code>, so this is its
            degraded render — the state a published page shows when the section using it is
            missing <code>@hydrate</code>. All the content should still be here and readable.
          </p>
        ) : null}

        <div className="lab__stage">
          <div className="lab__viewport" style={{ width }}>
            <iframe
              key={frameKey}
              src={src}
              title={`${active?.name ?? dir} at ${width}px`}
              // Withholding allow-scripts is the no-JS test. allow-same-origin
              // stays so the frame can still load its own assets.
              sandbox={scripts ? 'allow-same-origin allow-scripts allow-forms' : 'allow-same-origin'}
            />
          </div>
        </div>

        {active ? (
          <footer className="lab__meta">
            <p>
              <strong>When to use.</strong> {active.whenToUse}
            </p>
            {/* Token AND the props that select it. One component can answer
                several behaviours — a shuffling deck and a scroll-pinned pile
                are different answers to "how should this behave?" — so the
                props are the half of the mapping that stops the agent guessing
                which one was meant. */}
            {active.implements.length > 0 ? (
              <>
                <p>
                  <strong>Answers.</strong> The behaviour tokens this component is the recipe for.
                </p>
                <ul className="lab__implements">
                  {active.implements.map(({ token, props }) => (
                    <li key={token}>
                      <code>{token}</code>
                      {Object.entries(props).map(([key, value]) => (
                        <span key={key}>
                          {key}={JSON.stringify(value)}
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
                {active.implements
                  .filter((entry) => entry.note)
                  .map((entry) => (
                    <p key={entry.token} className="lab__note">
                      <code>{entry.token}</code> {entry.note}
                    </p>
                  ))}
              </>
            ) : null}
          </footer>
        ) : null}
      </main>
    </div>
  );
}
