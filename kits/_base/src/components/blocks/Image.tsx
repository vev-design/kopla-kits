// The photographic branch of a media slot. Fills whatever frame the host
// section provides (sections own aspect ratio, rounding, and background).

/**
 * A photograph or illustration. The image fills the section's media frame
 * edge to edge (`object-cover`), so any aspect ratio works.
 */
export interface ImageBlockProps {
  kind: 'image';
  /**
   * Image URL.
   * @kind image
   */
  src: string;
  /** Alt text describing the image. 1 sentence, plain language. */
  alt: string;
}

export function ImageBlock({ src, alt }: ImageBlockProps) {
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}
