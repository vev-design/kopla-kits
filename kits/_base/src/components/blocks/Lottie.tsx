// The animated branch of a media slot — a Lottie animation (a `.json` file).
//
// Renders MARKUP ONLY: an empty, sized element carrying the file's URL and the
// playback settings as `data-kopla-lottie-*` attributes. It imports no player
// and runs no client JS, so a section hosting it stays static (no `@hydrate`).
// The host supplies the player — loading it only on pages that carry an
// animation, and only once one comes into view — the same split as the form
// contract: what a visitor SEES (size, placement) belongs to the section; how
// the file is fetched and played does not, and a section that imports its own
// player is a player every design system has to get right on its own.
//
// Without a host player the element is an empty frame of the right size, which
// is the failure direction to want: nothing breaks around it.
//
// Works at any size. As a CONTENT animation it fills the section's media frame
// like the image block; as an ANIMATED ICON it is the same block at icon size,
// usually with `play: 'hover'`.

/**
 * An animation from a Lottie file. Plays while it is visible by default, loops,
 * and fits inside the frame without cropping.
 */
export interface LottieBlockProps {
  kind: 'lottie';
  /**
   * Lottie animation file — a `.json` URL.
   * @kind url
   */
  src: string;
  /** What the animation shows, for screen readers. A short phrase. */
  label: string;
  /**
   * When it plays: `view` while it is on screen (the default), `load` as soon
   * as the page is ready, `hover` only while pointed at — the usual choice for
   * an animated icon.
   */
  play?: 'view' | 'load' | 'hover';
  /** Play through once and hold the last frame, instead of looping. Off unless set. */
  playOnce?: boolean;
  /** Playback speed — 1 is the file's own pace, 2 is twice as fast. */
  speed?: number;
}

export function LottieBlock({ src, label, play, playOnce, speed }: LottieBlockProps) {
  return (
    <div
      data-kopla-lottie={src}
      data-kopla-lottie-play={play ?? 'view'}
      // A flag is on only when literally `true`: an optional prop reaches a
      // section as `null`, which a default parameter would not catch.
      data-kopla-lottie-loop={playOnce === true ? 'false' : 'true'}
      {...(typeof speed === 'number' && speed > 0 ? { 'data-kopla-lottie-speed': String(speed) } : {})}
      role="img"
      aria-label={label}
      className="h-full w-full"
    />
  );
}
