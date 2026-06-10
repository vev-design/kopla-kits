// /kit/<slug> — one kit's full section chain, chrome-free: it's both
// the full-page preview and the gallery's scaled-iframe thumbnail.
import { notFound } from 'next/navigation';
import { kits } from '../../../../kits.gen/manifests';
import { KitFrame } from './KitFrame';

export function generateStaticParams() {
  return kits.map((kit) => ({ slug: kit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = kits.find((k) => k.slug === slug);
  return { title: `${kit?.name ?? slug} — Kopla Kits`, description: kit?.description };
}

export default async function KitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!kits.some((k) => k.slug === slug)) notFound();
  return <KitFrame slug={slug} />;
}
