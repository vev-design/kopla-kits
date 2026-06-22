// The moving-image branch of a media slot. Accepts a direct video file
// (mp4/webm), a YouTube link, or a Vimeo link, and renders the right element
// for each: a native `<video controls>` for files, a provider `<iframe>` for
// YouTube/Vimeo. Both are plain HTML (URL parsing happens at render time, no
// client JS), so sections hosting it stay static (`hydrate` not needed). Like
// the image block, it fills whatever frame the host section provides (sections
// own aspect ratio, rounding, and background).

/**
 * A video clip. Paste a direct file URL (mp4/webm), a YouTube link, or a
 * Vimeo link — the block detects the source and embeds it natively, playing
 * inline and filling the section's media frame.
 */
export interface VideoBlockProps {
  kind: 'video';
  /**
   * Video URL — a direct file (mp4/webm), a YouTube link (youtube.com/watch,
   * youtu.be, /shorts), or a Vimeo link (vimeo.com/…).
   * @kind url
   */
  src: string;
  /**
   * Poster image shown before playback. Applies to direct-file videos only;
   * YouTube and Vimeo show their own thumbnail.
   * @kind image
   */
  poster?: string;
  /** Short description of the clip, for screen readers. 1 sentence, plain language. */
  title: string;
}

/**
 * Turn a YouTube or Vimeo link into its privacy-friendly embed URL. Returns
 * null for anything else, which is then treated as a direct file. Pure string
 * work, so the block stays static.
 */
function embedUrl(src: string): string | null {
  const ytId = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/.exec(src)?.[1];
  if (ytId) return `https://www.youtube-nocookie.com/embed/${ytId}`;

  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/.exec(src);
  const vimeoId = vimeo?.[1];
  if (vimeoId) {
    const hash = vimeo?.[2];
    return `https://player.vimeo.com/video/${vimeoId}${hash ? `?h=${hash}` : ''}`;
  }
  return null;
}

export function VideoBlock({ src, poster, title }: VideoBlockProps) {
  const embed = embedUrl(src);
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        allowFullScreen
      />
    );
  }
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
