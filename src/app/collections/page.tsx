import type { Metadata } from 'next';
import { ResearchShelf } from '@/components/workbench/ResearchShelf';

export const metadata: Metadata = {
  title: 'Saved on this device',
  description: 'The dataset records you have saved in this browser — open, compare, or export them as a research brief. Nothing is synced to an account.',
};

export default function CollectionsPage() {
  return <ResearchShelf />;
}
