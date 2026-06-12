// The media slot — a discriminated union over the blocks a section's
// media column can host. A section narrows the union to exactly the
// kinds it accepts (e.g. `media: ImageBlockProps | ChartBlockProps`);
// design.json then carries that contract, so hosts and agents can only
// fill the slot with what the kit author allowed.

import type { ImageBlockProps } from './Image';
import { ImageBlock } from './Image';
import type { ChartBlockProps } from './Chart';
import { ChartBlock } from './Chart';

/** Everything a media slot can hold. Sections usually accept a subset. */
export type MediaBlockProps = ImageBlockProps | ChartBlockProps;

/**
 * Renders whichever block the slot value carries, adapted to fill the
 * section's media frame: images cover it edge to edge; charts center
 * with breathing room (the frame's background shows through).
 */
export function MediaBlock({ media }: { media: MediaBlockProps }) {
  switch (media.kind) {
    case 'image':
      return <ImageBlock {...media} />;
    case 'chart':
      return (
        <div className="flex h-full w-full items-center justify-center p-6">
          <ChartBlock {...media} />
        </div>
      );
  }
}
