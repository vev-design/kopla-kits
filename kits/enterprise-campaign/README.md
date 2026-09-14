# Enterprise Campaign

An airy, outcome-led system for enterprise campaign pages: Inter typography, expansive white space, near-black contrast moments, precise hairlines, and compact bursts of optimistic colour. Its navigation pairs a three-circle pink mark with a text wordmark, giving enterprise work-management narratives a compact, distinct lockup. The voice favors direct, active statements and makes room for people, proof, and practical next steps.

The theme uses Inter and a single light-first palette built around #0d0d0d, white, subdued slate text, soft grey surfaces, and coral-to-lilac accents. Components are intentionally minimal: a pill button for five action treatments, responsive native-disclosure navigation, and a bordered feature card for teammates or product capabilities. `WebinarRegistration` adds a high-intent native form with agenda, in-place confirmation, and an error state for event-led enterprise campaigns. All motion is CSS-only, including scroll-linked connector lines and restrained hover responses.

## Composition

The chain begins with Hero, which establishes the product thesis in an oversized type-led moment and immediately anchors it in social proof. WebinarRegistration follows while attention is highest, pairing event logistics and a focused native signup with a clear agenda. GraphFeature then deepens the promise through an editable media scene and native disclosure details. AgentGrid turns that high-level platform story into tangible roles and outcomes, using a horizontally scrollable card runway on smaller screens.

ProductShowcase is the high-contrast pivot: it breaks the white rhythm with a near-black media stage and focuses attention on one platform-level promise. CustomerStory then brings the pace back down through an editorial image and outcome quote, giving the presentation a credible human voice before conversion begins.

GettingStarted offers several generous, low-friction paths forward; Awards provides external validation immediately before the final commitment. ClosingCta delivers the last large-scale platform statement, while Footer supplies the quiet legal and navigational close for pages that need it.

## Sections

The public section order is maintained in `src/sections/index.ts`:

- Hero
- WebinarRegistration
- GraphFeature
- AgentGrid
- ProductShowcase
- CustomerStory
- GettingStarted
- Awards
- ClosingCta
- Footer

## Catalog

`Button`, `Nav`, and `FeatureCard` are reusable catalog components under `src/components/` and are composed by the sections. Their static showcases are exported through `src/components/index.ts` for the Components view.
