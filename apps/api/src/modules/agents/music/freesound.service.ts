import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../../config/env';

export interface FreesoundSample {
  id: number;
  name: string;
  tags: string[];
  durationSec: number;
  url: string;
  previewUrl: string | null;
  license: string;
}

/**
 * Freesound.org sample search via a personal API key (token auth).
 * Returns typed errors when FREESOUND_API_KEY is missing so the agent
 * can say so plainly instead of inventing samples.
 */
@Injectable()
export class FreesoundService {
  private readonly logger = new Logger(FreesoundService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  isConfigured(): boolean {
    return !!this.config.get('FREESOUND_API_KEY', { infer: true });
  }

  async search(query: string, limit = 10): Promise<FreesoundSample[]> {
    const key = this.config.get('FREESOUND_API_KEY', { infer: true });
    if (!key) throw new Error('Freesound not configured — set FREESOUND_API_KEY');

    const url = new URL('https://freesound.org/apiv2/search/text/');
    url.searchParams.set('query', query);
    url.searchParams.set('page_size', String(Math.min(limit, 30)));
    url.searchParams.set('fields', 'id,name,tags,duration,url,previews,license');

    const res = await fetch(url, {
      headers: { Authorization: `Token ${key}` },
    });
    if (!res.ok) throw new Error(`Freesound search ${res.status}: ${await res.text()}`);

    const payload = (await res.json()) as {
      results: Array<{
        id: number;
        name: string;
        tags: string[];
        duration: number;
        url: string;
        previews?: { 'preview-hq-mp3'?: string; 'preview-lq-mp3'?: string };
        license: string;
      }>;
    };
    return payload.results.map((r) => ({
      id: r.id,
      name: r.name,
      tags: r.tags ?? [],
      durationSec: r.duration,
      url: r.url,
      previewUrl: r.previews?.['preview-hq-mp3'] ?? r.previews?.['preview-lq-mp3'] ?? null,
      license: r.license,
    }));
  }
}
