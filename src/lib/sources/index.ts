import 'server-only';
import { huggingface } from './huggingface';
import { github } from './github';
import type { SourceAdapter } from './types';

const adapters: Record<string, SourceAdapter> = { huggingface, github };

export function adapterFor(platform: string): SourceAdapter | null {
  return adapters[platform] ?? null;
}
