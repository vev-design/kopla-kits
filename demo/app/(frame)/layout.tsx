// Root layout for kit pages — separate route group from the gallery so
// kit token CSS and gallery chrome never share a document (see the
// gallery layout for the why). No global CSS here: each kit page pulls
// in exactly one generated kit entry (kits.gen/<slug>.ts → <slug>.css).
import type { ReactNode } from 'react';

export default function FrameLayout({ children }: { children: ReactNode }) {
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
