import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../../config/env';

interface SpotifyToken {
  token: string;
  expiresAt: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  url: string;
  previewUrl: string | null;
  popularity: number;
}

/**
 * Spotify Web API via the Client Credentials grant. Caches the access token
 * in-memory until ~60s before expiry. Gracefully degrades when SPOTIFY_CLIENT_ID
 * or SPOTIFY_CLIENT_SECRET are absent — callers receive a typed error the
 * agent can narrate instead of a fabricated track list.
 */
@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private tokenCache: SpotifyToken | null = null;

  constructor(private readonly config: ConfigService<Env, true>) {}

  isConfigured(): boolean {
    return (
      !!this.config.get('SPOTIFY_CLIENT_ID', { infer: true }) &&
      !!this.config.get('SPOTIFY_CLIENT_SECRET', { infer: true })
    );
  }

  async search(query: string, limit = 10): Promise<SpotifyTrack[]> {
    const token = await this.accessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=${Math.min(limit, 20)}&q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Spotify search ${res.status}: ${body.slice(0, 120)}`);
    }
    const payload = (await res.json()) as {
      tracks: {
        items: Array<{
          id: string;
          name: string;
          popularity: number;
          preview_url: string | null;
          external_urls: { spotify: string };
          artists: Array<{ name: string }>;
          album: { name: string };
        }>;
      };
    };
    return payload.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name),
      album: t.album.name,
      url: t.external_urls.spotify,
      previewUrl: t.preview_url,
      popularity: t.popularity,
    }));
  }

  private async accessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60_000) {
      return this.tokenCache.token;
    }

    const id = this.config.get('SPOTIFY_CLIENT_ID', { infer: true });
    const secret = this.config.get('SPOTIFY_CLIENT_SECRET', { infer: true });
    if (!id || !secret) {
      throw new Error('Spotify not configured — set SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET');
    }

    const basic = Buffer.from(`${id}:${secret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`Spotify token ${res.status}: ${await res.text()}`);
    const payload = (await res.json()) as { access_token: string; expires_in: number };
    this.tokenCache = {
      token: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000,
    };
    return payload.access_token;
  }
}
