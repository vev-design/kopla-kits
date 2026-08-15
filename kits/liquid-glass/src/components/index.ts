// Liquid Glass component catalog: this kit shadows _base's default Button
// with its own glass pill (specular hover sheen) instead of adopting the
// _base default, and adds its own primitives. This file SHADOWS
// _base/src/components/index.ts — the assembled workspace uses this one,
// and the extractor reads it into design.json.components. Export order is
// catalog order.
export * from './Button'; // kit-owned — replaces the _base default
export * from './Badge';
export * from './GlassCard';
