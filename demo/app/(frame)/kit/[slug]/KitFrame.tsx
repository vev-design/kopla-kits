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

  return (
    <>
      {sections.map(({ name, component, demo }) => (
        <SectionBoundary key={name} name={name}>
          {createElement(component, { id: name.toLowerCase(), ...(demo ?? {}) })}
        </SectionBoundary>
      ))}
    </>
  );
}
