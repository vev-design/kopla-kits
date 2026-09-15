// The moving-image branch of a media slot. Accepts a direct video file
// (mp4/webm), a YouTube link, or a Vimeo link, and renders the right element
// for each: a native `<video>` for files, a provider `<iframe>` for
// YouTube/Vimeo. Both are plain HTML (URL parsing happens at render time, no
// client JS), so sections hosting it stay static (`hydrate` not needed). Like
// the image block, it fills whatever frame the host section provides (sections
// own aspect ratio, rounding, and background).
//
// It also owns the clip's PLAYBACK — autoplay, mute, loop, whether the play bar
// shows — and that is the reason a section must never hand-write its own
// `<video>`. Those four are props here, so whoever edits the page gets a switch
// for each in the editor's inspector, with no prompt and no rebuild; the same
// settings written as attributes inside a section are invisible to it, and the
// person who wanted the hero to loop has to come back and ask for every change.

/**
 * A video clip. Paste a direct file URL (mp4/webm), a YouTube link, or a
 * Vimeo link — the block detects the source and embeds it natively, playing
 * inline and filling the section's media frame.
 *
 * Playback is configured through the four optional flags below rather than by
 * the section: each is OFF when omitted, which is the ordinary video a reader
 * expects (visible controls, no autoplay, plays once).
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
  /**
   * Start the clip as soon as the page can. Browsers only allow this with the
   * sound off, so it turns muting on with it. Off unless set.
   */
  autoplay?: boolean;
  /** Play without sound. Stays on while `autoplay` is on. Off unless set. */
  muted?: boolean;
  /** Start over when the clip ends. Off unless set. */
  loop?: boolean;
  /**
   * Hide the player's own controls — the play bar, scrubber and volume. Pair
   * with `autoplay` and `loop` for an ambient background clip; on its own it
   * leaves nothing able to start the video. Off unless set.
   */
  hideControls?: boolean;
}

/** What the four flags resolve to, once autoplay's implication is applied. */
interface Playback {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  hideControls: boolean;
}

/** A flag is on only when it is literally `true`. An optional prop the editor
 *  has seeded reaches a section as `null`, which a default parameter would not
 *  catch — so absent, null and false all have to mean the same page. */
const on = (value: boolean | null | undefined): boolean => value === true;

function playbackOf(props: VideoBlockProps): Playback {
  const autoplay = on(props.autoplay);
  return {
    autoplay,
    // Browsers refuse to START a clip that has sound, so an autoplaying video
    // that isn't muted simply never plays — and it fails silently, on the live
    // page only. Forcing it here is the difference between the setting working
    // and the setting appearing to do nothing. The stored prop is untouched, so
    // turning autoplay back off restores whatever the author chose.
    muted: on(props.muted) || autoplay,
    loop: on(props.loop),
    hideControls: on(props.hideControls),
  };
}

/**
 * Turn a YouTube or Vimeo link into its privacy-friendly embed URL, carrying
 * the playback settings as the provider's own parameters. Returns null for
 * anything else, which is then treated as a direct file. Pure string work, so
 * the block stays static.
 */
function embedUrl(src: string, playback: Playback): string | null {
  const ytId = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/.exec(src)?.[1];
  if (ytId) {
    const q = new URLSearchParams();
    if (playback.autoplay) {
      q.set('autoplay', '1');
      // iOS refuses to autoplay anything that would go full-screen.
      q.set('playsinline', '1');
    }
    if (playback.muted) q.set('mute', '1');
    if (playback.loop) {
      q.set('loop', '1');
      // YouTube IGNORES `loop` on a single video unless the same id is also the
      // playlist — the documented quirk, and the reason a loop set here used to
      // do nothing at all.
      q.set('playlist', ytId);
    }
    if (playback.hideControls) q.set('controls', '0');
    const query = q.toString();
    return `https://www.youtube-nocookie.com/embed/${ytId}${query ? `?${query}` : ''}`;
  }

  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/.exec(src);
  const vimeoId = vimeo?.[1];
  if (vimeoId) {
    const q = new URLSearchParams();
    const hash = vimeo?.[2];
    if (hash) q.set('h', hash);
    if (playback.autoplay) q.set('autoplay', '1');
    if (playback.muted) q.set('muted', '1');
    if (playback.loop) q.set('loop', '1');
    if (playback.hideControls) q.set('controls', '0');
    // Vimeo's own ambient mode: chrome off, muted, looping. Asked for
    // explicitly because `controls=0` alone is gated on the account's plan,
    // while `background=1` is not — so the combination everybody actually means
    // by "a silent looping backdrop" works on any account.
    if (playback.autoplay && playback.loop && playback.hideControls) q.set('background', '1');
    const query = q.toString();
    return `https://player.vimeo.com/video/${vimeoId}${query ? `?${query}` : ''}`;
  }
  return null;
}

export function VideoBlock(props: VideoBlockProps) {
  const { src, poster, title } = props;
  const playback = playbackOf(props);
  const embed = embedUrl(src, playback);
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
      autoPlay={playback.autoplay}
      muted={playback.muted}
      loop={playback.loop}
      controls={!playback.hideControls}
      playsInline
      // An autoplaying clip is going to be fetched anyway, so asking for
      // metadata only makes it start late.
      preload={playback.autoplay ? 'auto' : 'metadata'}
      className="h-full w-full object-cover"
    />
  );
}
