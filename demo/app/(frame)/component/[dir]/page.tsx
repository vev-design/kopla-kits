// /component/<dir> — one catalog component, chrome-free, for the lab's iframe.
//
// In the (frame) route group for the same reason kit pages are: the component
// renders against a kit's token CSS, and gallery chrome must never share a
// document with it.
//
// The theme is a server-rendered <link> to a PRECOMPILED stylesheet
// (public/lab-themes/<slug>.css), which is the whole mechanism: no theme state,
// nothing fetched on demand, and — the property everything else here leans on —
// every theme is styled with scripts OFF, because a <link> tag needs no
// hydration. The dynamic-import version this replaced resolved its module
// without ever injecting CSS under `next dev`, so the lab silently showed the
// default theme whatever was picked; see gen-components.mjs for the record.
import { notFound } from 'next/navigation';
import { components } from '../../../../components.gen/manifests';
// An unknown `?theme=` slug falls back to the default rather than 404ing the
// stylesheet and rendering the component bare.
import { defaultTheme, themeHref, themes } from '../../../../components.gen/themes';
import { ComponentStage } from './ComponentStage';

export function generateStaticParams() {
  return components.map((c) => ({ dir: c.dir }));
}

export async function generateMetadata({ params }: { params: Promise<{ dir: string }> }) {
  const { dir } = await params;
  const found = components.find((c) => c.dir === dir);
  return { title: `${found?.name ?? dir} — Component lab`, description: found?.description };
}

/** Query state, parsed on the SERVER so it reaches the markup even with scripts
 *  disabled — the same reason the stage takes props instead of reading
 *  `window.location`. */
function readNumber(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function ComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ dir: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dir } = await params;
  const query = await searchParams;
  if (!components.some((c) => c.dir === dir)) notFound();
  const requested = Array.isArray(query.theme) ? query.theme[0] : query.theme;
  const theme = requested && themes.includes(requested) ? requested : defaultTheme;
  return (
    <>
      {/* `precedence` is what makes React hoist this into <head>, dedupe it, and
          hold the paint until the sheet has loaded — the no-flash behaviour the
          old visibility:hidden gate faked, from one attribute. */}
      <link rel="stylesheet" href={themeHref(theme)} precedence="default" />
      <ComponentStage
        dir={dir}
        index={readNumber(query.case)}
        reducedMotion={query.motion === 'reduce'}
      />
    </>
  );
}
