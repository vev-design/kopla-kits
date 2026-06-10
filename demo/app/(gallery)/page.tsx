// / — the kit gallery. One card per kit with a LIVE scaled-iframe
// preview of /kit/<slug> (no hand-authored thumbnails to keep in
// sync — the preview is the kit). Server component: zero client JS.
import type { CSSProperties } from 'react';
import { kits, type Kit } from '../../kits.gen/manifests';

function KitCard({ kit }: { kit: Kit }) {
  const href = `/kit/${kit.slug}`;
  return (
    <a className="card" href={href}>
      <div
        className="card__preview"
        style={{ '--kit-accent': kit.accent ?? '#5B5BD6' } as CSSProperties}
      >
        <iframe src={href} title={`${kit.name} preview`} loading="lazy" tabIndex={-1} aria-hidden />
      </div>
      <div className="card__body">
        <div className="card__title-row">
          <span className="card__swatch" style={{ background: kit.accent ?? '#5B5BD6' }} />
          <h2>{kit.name}</h2>
          {kit.featured ? <span className="card__featured">Featured</span> : null}
        </div>
        <p>{kit.description}</p>
        <div className="card__tags">
          {kit.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function Gallery() {
  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Kopla Kits</h1>
        <p>
          {kits.length} design-system starting points. Each card is a live render of the kit&apos;s
          full section chain with its demo content — click through for the real page. Agents can
          pull any kit via the MCP endpoint at <code>/api/mcp</code>.
        </p>
      </header>
      <div className="gallery__grid">
        {kits.map((kit) => (
          <KitCard key={kit.slug} kit={kit} />
        ))}
      </div>
    </main>
  );
}
