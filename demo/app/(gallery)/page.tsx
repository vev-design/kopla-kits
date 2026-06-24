// / — the kit gallery. One card per kit with a LIVE scaled-iframe
// preview of /kit/<slug> (no hand-authored thumbnails to keep in
// sync — the preview is the kit). The card grid is a server component;
// only the theme toggle ships client JS.
import type { CSSProperties } from 'react';
import { kits, type Kit } from '../../kits.gen/manifests';
import ThemeToggle from './ThemeToggle';

function KitCard({ kit }: { kit: Kit }) {
  const href = `/kit/${kit.slug}`;
  const accent = kit.accent ?? '#5B5BD6';
  return (
    <a className="card" href={href} style={{ '--kit-accent': accent } as CSSProperties}>
      <div className="card__preview">
        <iframe src={href} title={`${kit.name} preview`} loading="lazy" tabIndex={-1} aria-hidden />
      </div>
      <div className="card__body">
        <div className="card__title-row">
          <span className="card__swatch" style={{ background: accent }} />
          <h2>{kit.name}</h2>
          {kit.featured ? <span className="card__featured">Featured</span> : null}
          <span className="card__arrow" aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
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
    <>
      <div className="mesh" aria-hidden />
      <main className="gallery">
        <nav className="topbar">
          <div className="topbar__brand">
            <span className="topbar__mark" aria-hidden />
            <span>Kopla kits</span>
          </div>
          <div className="topbar__actions">
            <a
              className="pill"
              href="/api/mcp"
              title="Agents can pull any kit via this MCP endpoint"
            >
              <span className="pill__dot" aria-hidden />
              <code>/api/mcp</code>
            </a>
            <ThemeToggle />
            <a
              className="pill pill--icon"
              href="https://github.com/vev-design/kopla-kits"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              title="View source on GitHub"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
        </nav>
        <div className="gallery__grid">
          {kits.map((kit) => (
            <KitCard key={kit.slug} kit={kit} />
          ))}
        </div>
      </main>
    </>
  );
}
