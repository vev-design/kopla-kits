/** Gallery canvas states, also used by the lab. */
export const CarouselShowcase = [
  {
    label: 'Three slides, arrows and dots',
    props: {
      label: 'Customer stories',
      className: 'max-w-3xl',
      items: [
        {
          kicker: 'Retail',
          title: 'Launched a campaign in an afternoon',
          body: 'Their design system was already in Figma. The landing page came out of it the same day.',
        },
        {
          kicker: 'Fintech',
          title: 'Forty pages, one system',
          body: 'Every regional page now reads as the same brand, because it is built from the same tokens.',
        },
        {
          kicker: 'Media',
          title: 'Release notes that ship themselves',
          body: 'Written from the changelog, laid out by the system, published to their own domain.',
        },
      ],
    },
  },
  {
    label: 'Two slides, arrows only',
    props: {
      label: 'Our work',
      className: 'max-w-3xl',
      controls: 'arrows',
      items: [
        { title: 'A brand refresh', body: 'Tokens first, pages after.' },
        { title: 'A product launch', body: 'One system, four channels.' },
      ],
    },
  },
  {
    label: 'Three per view',
    props: {
      label: 'Services',
      className: 'max-w-5xl',
      perView: 'three',
      items: [
        { title: 'Audit', body: 'What you have, and what it costs you.' },
        { title: 'System', body: 'Decided once, written down.' },
        { title: 'Build', body: 'Pages out of the system, not beside it.' },
        { title: 'Measure', body: 'What the pages did, in your own analytics.' },
        { title: 'Iterate', body: 'Change the token, not the forty pages.' },
      ],
    },
  },
  {
    // Longhand on purpose. `Array.from(...)` reads better and is WRONG here:
    // extract-design.mjs reads static literals only, so a generated case is
    // skipped entirely — it would still render in the component lab (which
    // imports the real module) while being absent from design.json.
    label: 'Ten slides',
    props: {
      label: 'The route',
      className: 'max-w-3xl',
      items: [
        { title: 'Stage 1', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 2', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 3', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 4', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 5', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 6', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 7', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 8', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 9', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 10', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    label: 'Long title, no body, no image',
    props: {
      label: 'Notes',
      className: 'max-w-3xl',
      items: [
        {
          title:
            'A deliberately overlong slide heading that has to wrap onto several lines without pushing anything out of the slide or the document',
        },
        { title: 'Short one' },
        { title: 'Another perfectly ordinary heading' },
      ],
    },
  },
  {
    label: 'Image on one slide only',
    props: {
      label: 'Gallery',
      className: 'max-w-3xl',
      items: [
        {
          title: 'With a picture',
          body: 'This one has an image.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60',
        },
        { title: 'Without a picture', body: 'This one does not, and must not collapse.' },
        {
          title: 'With a picture again',
          body: 'Back to an image.',
          image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60',
        },
      ],
    },
  },
  {
    // The interval here is the SHOWCASE's own number, chosen to be watchable in
    // the component lab. A real page's interval comes from the design's own
    // prototype timing, never from this file and never from a guess.
    label: 'Auto-advancing every 4s',
    props: {
      label: 'Featured',
      className: 'max-w-3xl',
      autoAdvanceMs: 4000,
      items: [
        { kicker: 'One', title: 'First up', body: 'Advances on its own, and stops when you touch it.' },
        { kicker: 'Two', title: 'Then this', body: 'The pause control is the first thing in the row.' },
        { kicker: 'Three', title: 'And back around', body: 'Because loop is on by default.' },
      ],
    },
  },
  {
    label: 'Auto-advancing, no loop, dots only',
    props: {
      label: 'Featured',
      className: 'max-w-3xl',
      autoAdvanceMs: 3000,
      loop: false,
      controls: 'dots',
      items: [
        { title: 'First', body: 'Runs to the end and stops there.' },
        { title: 'Second', body: 'No wrap-around.' },
        { title: 'Third', body: 'And that is where it stays.' },
      ],
    },
  },
  {
    label: 'Bare track, no controls',
    props: {
      label: 'Logos',
      className: 'max-w-3xl',
      controls: 'none',
      perView: 'three',
      items: [
        { title: 'Acme Corp' },
        { title: 'Northwind' },
        { title: 'Globex' },
        { title: 'Initech' },
        { title: 'Umbrella' },
      ],
    },
  },
];
