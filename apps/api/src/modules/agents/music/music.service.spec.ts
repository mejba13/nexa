import { describe, expect, it, vi } from 'vitest';

import type { RetrievalService } from '../../../shared/rag/retrieval.service';

import type { FreesoundService } from './freesound.service';
import { MusicService } from './music.service';
import type { SpotifyService } from './spotify.service';

/**
 * MusicService encodes a critical invariant via `LookupResult<T>`: when an
 * external API (Spotify / Freesound) is not configured, the tool returns
 * { ok: false, reason } instead of fabricating URLs. These tests guard that
 * contract — a regression here would let the agent hallucinate real-looking
 * links to tracks or samples that don't exist.
 */
function buildService(
  overrides: {
    spotifyConfigured?: boolean;
    freesoundConfigured?: boolean;
    spotifyThrows?: boolean;
  } = {},
) {
  const spotify = {
    isConfigured: () => overrides.spotifyConfigured ?? true,
    search: overrides.spotifyThrows
      ? vi.fn().mockRejectedValue(new Error('upstream 429'))
      : vi.fn().mockResolvedValue([
          {
            id: 't1',
            name: 'Track',
            artists: ['A'],
            album: 'X',
            url: 'https://open.spotify.com/t1',
            previewUrl: null,
            popularity: 50,
          },
        ]),
  } as unknown as SpotifyService;

  const freesound = {
    isConfigured: () => overrides.freesoundConfigured ?? true,
    search: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Rain',
        tags: ['ambient'],
        durationSec: 60,
        url: 'https://freesound.org/s/1',
        previewUrl: null,
        license: 'CC0',
      },
    ]),
  } as unknown as FreesoundService;

  const retrieval = {
    retrieve: vi.fn().mockResolvedValue([]),
  } as unknown as RetrievalService;

  return new MusicService(spotify, freesound, retrieval);
}

describe('MusicService.searchReferences', () => {
  it('returns ok=false with a configuration reason when Spotify creds are missing', async () => {
    const svc = buildService({ spotifyConfigured: false });
    const out = await svc.searchReferences('lofi', 5);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.reason).toMatch(/SPOTIFY_CLIENT_ID/);
    }
  });

  it('returns ok=false with the upstream error when Spotify throws', async () => {
    const svc = buildService({ spotifyThrows: true });
    const out = await svc.searchReferences('lofi', 5);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/upstream 429/);
  });

  it('returns ok=true with real track data when configured', async () => {
    const svc = buildService();
    const out = await svc.searchReferences('lofi', 5);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.data[0]!.url).toMatch(/^https:\/\/open\.spotify\.com/);
    }
  });
});

describe('MusicService.findSamples', () => {
  it('returns ok=false with a configuration reason when Freesound is not set up', async () => {
    const svc = buildService({ freesoundConfigured: false });
    const out = await svc.findSamples('thunder', 5);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/FREESOUND_API_KEY/);
  });

  it('returns ok=true with real sample data when configured', async () => {
    const svc = buildService();
    const out = await svc.findSamples('thunder', 5);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.data[0]!.url).toMatch(/^https:\/\/freesound\.org/);
    }
  });
});

describe('MusicService.paletteFor', () => {
  it('returns a curated palette for a known genre', () => {
    const svc = buildService();
    const palette = svc.paletteFor('lo-fi hiphop');
    expect(palette).not.toBeNull();
    expect(palette?.bpmRange.min).toBeGreaterThan(0);
    expect(palette?.core.length).toBeGreaterThan(0);
  });

  it('returns null for an unknown genre — never fabricates one', () => {
    const svc = buildService();
    expect(svc.paletteFor('industrial-chiptune-fusion')).toBeNull();
  });
});

describe('MusicService.arrangementsFor', () => {
  it('returns templates matching the genre', () => {
    const svc = buildService();
    const popTemplates = svc.arrangementsFor('pop');
    expect(popTemplates.length).toBeGreaterThan(0);
    expect(popTemplates[0]!.sections.length).toBeGreaterThan(0);
  });

  it('returns an empty list when no template matches — agent must narrate the gap', () => {
    const svc = buildService();
    expect(svc.arrangementsFor('zzz-unknown-genre-xyz')).toEqual([]);
  });
});
