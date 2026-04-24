import { Injectable } from '@nestjs/common';

import { RetrievalService, type RetrievedChunk } from '../../../shared/rag/retrieval.service';

import { FreesoundService, type FreesoundSample } from './freesound.service';
import { ARRANGEMENT_TEMPLATES, paletteFor, type InstrumentPalette } from './instrument-palettes';
import { SpotifyService, type SpotifyTrack } from './spotify.service';

export type LookupResult<T> = { ok: true; data: T } | { ok: false; reason: string };

@Injectable()
export class MusicService {
  constructor(
    private readonly spotify: SpotifyService,
    private readonly freesound: FreesoundService,
    private readonly retrieval: RetrievalService,
  ) {}

  async searchReferences(query: string, limit = 10): Promise<LookupResult<SpotifyTrack[]>> {
    if (!this.spotify.isConfigured()) {
      return {
        ok: false,
        reason:
          'Spotify API is not configured on this environment (SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET). Ask the user to add credentials or suggest references you already know without inventing URLs.',
      };
    }
    try {
      const data = await this.spotify.search(query, limit);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  async findSamples(query: string, limit = 10): Promise<LookupResult<FreesoundSample[]>> {
    if (!this.freesound.isConfigured()) {
      return {
        ok: false,
        reason:
          'Freesound is not configured (FREESOUND_API_KEY missing). Describe sample characteristics verbally; do not invent URLs or IDs.',
      };
    }
    try {
      const data = await this.freesound.search(query, limit);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, reason: (err as Error).message };
    }
  }

  paletteFor(genre: string): InstrumentPalette | null {
    return paletteFor(genre);
  }

  arrangementsFor(genre: string) {
    const normalized = genre.trim().toLowerCase().replace(/\s+/g, '-');
    return ARRANGEMENT_TEMPLATES.filter((t) =>
      t.bestFor.some((b) => b === normalized || normalized.includes(b) || b.includes(normalized)),
    );
  }

  async mixingGuidance(userId: string, query: string, topK = 6): Promise<RetrievedChunk[]> {
    return this.retrieval.retrieve({
      userId,
      agentType: 'MUSIC',
      query,
      topK,
    });
  }
}
