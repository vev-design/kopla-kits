// The moving-image branch of a media slot. Like the image block, it fills
// whatever frame the host section provides (sections own aspect ratio,
// rounding, and background). Native `<video controls>` — no client JS — so
// sections hosting it stay static (`hydrate` not needed).

/**
 * A video clip. Plays inline with native controls and fills the section's
 * media frame edge to edge (`object-cover`), so any aspect ratio works.
 * Supply a `poster` still so the frame isn't blank before playback.
 */
export interface VideoBlockProps {
  kind: 'video';
  /**
   * Video file URL (mp4 or webm).
   * @kind url
   */
  src: string;
  /**
   * Poster image shown before playback.
   * @kind image
   */
  poster?: string;
  /** Short description of the clip, for screen readers. 1 sentence, plain language. */
  title: string;
}

export function VideoBlock({ src, poster, title }: VideoBlockProps) {
  return (
    <video
      src={src}
      poster={poster ?? undefined}
      aria-label={title}
      controls
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  );
}
