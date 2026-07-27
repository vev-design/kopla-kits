'use client';

// Loads the generated kit entry (kits.gen/<slug>.ts: the kit's CSS +
// its section modules in barrel order) and renders every section with
// its `<Name>Demo` props export.

import {
  Component,
  createElement,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { kitModules } from '../../../../kits.gen';
import './kitcards.css';

interface LoadedSection {
  name: string;
  component: ComponentType<Record<string, unknown>>;
  demo: Record<string, unknown> | null;
}

async function loadSections(slug: string): Promise<LoadedSection[]> {
  const loadKit = kitModules[slug];
  if (!loadKit) throw new Error(`unknown kit "${slug}"`);
  const { sections } = await loadKit(); // importing the entry also loads the kit CSS

  const loaded: LoadedSection[] = [];
  for (const { load } of sections) {
    const mod: Record<string, unknown> = await load();
    for (const [exportName, value] of Object.entries(mod)) {
      if (typeof value !== 'function') continue; // *Demo objects, types
      const demo = mod[`${exportName}Demo`];
      loaded.push({
        name: exportName,
        component: value as ComponentType<Record<string, unknown>>,
        demo: demo && typeof demo === 'object' ? (demo as Record<string, unknown>) : null,
      });
    }
  }
  return loaded;
}

class SectionBoundary extends Component<
  { name: string; children: ReactNode },
  { error: Error | null }
> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#b91c1c' }}>
          ⚠ {this.props.name} failed to render: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export function KitFrame({ slug }: { slug: string }) {
  const [sections, setSections] = useState<LoadedSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 'cards' renders the labeled per-section gallery below; '&bg=transparent'
  // drops the view's own dot-grid so an embedding canvas (Kopla's intake)
  // shows through instead of double-framing. Resolved on the client after
  // mount (this is a client component; the page is static).
  const [view, setView] = useState<string | null>(null);
  const [bareBg, setBareBg] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setView(params.get('view'));
    setBareBg(params.get('bg') === 'transparent');
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSections(slug).then(
      (loaded) => {
        if (!cancelled) setSections(loaded);
      },
      (err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return <div style={{ padding: '2rem', fontFamily: 'monospace' }}>{error}</div>;
  }
  if (!sections) return null;

  // ?view=cards — every section as a labeled card on a dot grid (the shape
  // Kopla's design-system components board uses). Kopla's DS intake embeds
  // this view so a template preview shows WHAT THE KIT SHIPS, section by
  // section, instead of one continuous page. Read from location (not a
  // route param) so /kit/<slug> stays fully static.
  if (view === 'cards') {
    return (
      <div className={bareBg ? 'kitcards kitcards--bare' : 'kitcards'}>
        {sections.map(({ name, component, demo }, idx) => {
          const instances = Array.isArray(demo) ? demo : [demo ?? {}];
          const props = instances[0] ?? {};
          return (
            // name alone can repeat (a shared export in two section modules).
            <figure className="kitcards__card" key={`${name}-${idx}`}>
              <div className="kitcards__render">
                <SectionBoundary name={name}>
                  {createElement(component, {
                    id: name.toLowerCase(),
                    ...(props as Record<string, unknown>),
                  })}
                </SectionBoundary>
              </div>
              <figcaption className="kitcards__label">
                <span>{name}</span>
                {instances.length > 1 && <em>{instances.length} variants</em>}
              </figcaption>
            </figure>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {sections.flatMap(({ name, component, demo }) => {
        // A `<Name>Demo` may be a single props object OR an array of instances
        // (e.g. ImageText shown twice with the media on alternating sides) —
        // mirror extract-design's collectDemo and render one section per entry.
        const instances = Array.isArray(demo) ? demo : [demo ?? {}];
        const base = name.toLowerCase();
        return instances.map((props, i) => (
          <SectionBoundary key={`${name}-${i}`} name={name}>
            {createElement(component, {
              id: instances.length > 1 ? `${base}-${i}` : base,
              ...(props as Record<string, unknown>),
            })}
          </SectionBoundary>
        ));
      })}
    </>
  );
}
