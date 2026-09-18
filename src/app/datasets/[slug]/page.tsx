import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDataset } from '@/lib/api/client';

export const revalidate = 60;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getDataset(slug).catch(() => null);
  return record ? { title: record.name, description: record.description.slice(0,160) } : { title: 'Dataset record' };
}
/** Keep previously shared dataset links valid, with genuine missing-record 404s. */
export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await getDataset(slug);
  if (!record) notFound();
  redirect(`/workspace/?dataset=${encodeURIComponent(record.slug)}`);
}
