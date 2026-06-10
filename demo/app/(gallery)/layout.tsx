// Root layout for the gallery. The kit pages live under a SEPARATE
// root layout (app/(frame)/) on purpose: each kit's globals.css sets
// :root tokens, so the two surfaces must never share a stylesheet
// scope — crossing route groups forces a full document load, same
// isolation the old two-HTML-entries Vite setup had.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './gallery.css';

export const metadata: Metadata = {
  title: 'Kopla Kits',
  description:
    'Design-system starting points for Kopla — full UI libraries with a theme and a curated section chain.',
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
