// /fixture/<name> — a design-authored composition driving the ENGINE layer,
// chrome-free, for the specs. Same framing rules as /component/<dir>: in the
// (frame) group so gallery chrome never shares the document, theme as a
// server-rendered <link> so the fixture is styled with scripts off.
//
// Not part of the catalog contract on purpose: showcases are `{ props }`
// literals for the styled wrappers, and these fixtures exist to prove the
// OTHER layer — the author's own markup wearing the engine — which no props
// literal can express.
import { notFound } from 'next/navigation';
import { defaultTheme, themeHref, themes } from '../../../../components.gen/themes';
import { FixtureStage } from '../fixtures';

// Kept in step with FIXTURES in fixtures.tsx — the server side cannot read a
// client module's object, so the valid names live twice, and an unknown name
// 404s here rather than rendering an empty stage.
const NAMES = ['peek-carousel', 'mid-deck-hero', 'card-quiz'];

export function generateStaticParams() {
  return NAMES.map((name) => ({ name }));
}

export default async function FixturePage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { name } = await params;
  const query = await searchParams;
  if (!NAMES.includes(name)) notFound();
  const requested = Array.isArray(query.theme) ? query.theme[0] : query.theme;
  const theme = requested && themes.includes(requested) ? requested : defaultTheme;
  return (
    <>
      <link rel="stylesheet" href={themeHref(theme)} precedence="default" />
      <FixtureStage name={name} />
    </>
  );
}
