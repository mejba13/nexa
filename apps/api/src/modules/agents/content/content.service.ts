import { Injectable } from '@nestjs/common';

import { RetrievalService, type RetrievedChunk } from '../../../shared/rag/retrieval.service';

import { buildCalendar, type BuildCalendarInput, type CalendarGrid } from './calendar';
import {
  BLOG_SEO_SPEC,
  SOCIAL_SPECS,
  VIDEO_SPECS,
  type BlogSpec,
  type SocialPlatform,
  type SocialSpec,
  type VideoPlatform,
  type VideoSpec,
} from './platform-specs';

@Injectable()
export class ContentService {
  constructor(private readonly retrieval: RetrievalService) {}

  /** Brand voice = RAG over CONTENT agent documents. Tenant-scoped. */
  async queryBrandVoice(userId: string, query: string, topK = 6): Promise<RetrievedChunk[]> {
    return this.retrieval.retrieve({
      userId,
      agentType: 'CONTENT',
      query,
      topK,
    });
  }

  socialSpecFor(platform: SocialPlatform): SocialSpec {
    const spec = SOCIAL_SPECS[platform];
    if (!spec) throw new Error(`Unknown social platform: ${platform}`);
    return spec;
  }

  videoSpecFor(platform: VideoPlatform): VideoSpec {
    const spec = VIDEO_SPECS[platform];
    if (!spec) throw new Error(`Unknown video platform: ${platform}`);
    return spec;
  }

  blogSpec(): BlogSpec {
    return BLOG_SEO_SPEC;
  }

  buildCalendar(input: BuildCalendarInput): CalendarGrid {
    return buildCalendar(input);
  }
}
