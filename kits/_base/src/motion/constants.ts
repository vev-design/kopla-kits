// Shared timing values for motion wrappers. Pulled into Motion
// `transition` objects so durations/easings stay consistent across the
// system. Keep these in sync with the spec's motion timing.

export const DURATIONS = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.38,
  enter: 0.56,
} as const;

// Cubic-bezier values mirror the --ease-* CSS tokens. Motion takes
// arrays of [x1, y1, x2, y2] for cubic-bezier easings.
export const EASES = {
  default: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
} as const;
