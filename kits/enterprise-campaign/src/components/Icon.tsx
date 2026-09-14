import { Activity, ArrowRight, Menu, ShieldCheck, Sparkles, Trophy, Workflow } from 'lucide-react';

// This kit's icon surface. Props name an icon as a kebab-case string, so the
// names are mapped here onto lucide-react (a base dependency) rather than
// pulled from an icon service at build time: the set a prop may name is a
// closed union the type checker enforces, and widening it is one line.
const icons = {
  activity: Activity,
  'arrow-right': ArrowRight,
  menu: Menu,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  trophy: Trophy,
  workflow: Workflow,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const Glyph = icons[name];
  return <Glyph size={size} strokeWidth={1.75} aria-hidden />;
}
