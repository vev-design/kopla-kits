// Local section contract. Kept in the template so the design system
// stays a self-contained library with zero host dependency — it just
// follows the `id` convention.

/**
 * Props every section shares. Each section's `*Props` interface extends
 * this; the component renders `id` on its root element so menus/toolbars
 * can link to it in-page via `#<id>`.
 */
export interface SectionBaseProps {
  /** Stable anchor id, rendered as the root element's `id`. kebab-case,
   *  no leading '#' (e.g. "features", "pricing"). */
  id?: string | null;
}
