import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';

const inputSchema = z.object({
  theme: z.string().trim().min(1).max(300),
  tone: z
    .enum(['melancholic', 'upbeat', 'defiant', 'reflective', 'romantic', 'aggressive', 'playful'])
    .optional(),
  structure: z
    .enum(['verse-chorus', 'verse-pre-chorus', 'aaba', 'freeform'])
    .default('verse-chorus'),
  rhymeScheme: z.enum(['aabb', 'abab', 'abcb', 'free']).default('abab'),
});

/**
 * PRD §5 specifies generate_lyrics as "Claude-only (no tool)". The tool exists
 * so the agent is reminded which structural constraints apply; it returns a
 * deterministic scaffold (form + rhyme scheme + syllable guidance). The agent
 * then writes the lyric in a subsequent turn.
 */
@Injectable()
export class GenerateLyricsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'generate_lyrics';
  readonly description =
    'Returns a lyric scaffold (section list, rhyme scheme, syllable guidance). The agent writes the actual lines afterwards — this tool does not produce copy; it only locks structure.';
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    const sections = sectionsFor(input.structure);
    const rhyme = rhymeFor(input.rhymeScheme);
    return {
      theme: input.theme,
      tone: input.tone ?? null,
      structure: input.structure,
      rhymeScheme: input.rhymeScheme,
      sections,
      rhymeGuidance: rhyme,
      syllableGuidance: [
        'Keep lines within 7–12 syllables for singable cadence.',
        'Match syllable count across paired rhyme lines within ±1.',
        'Front-load strong consonants on downbeats.',
      ],
      writingConstraints: [
        'Never repeat the same word as an end-rhyme twice in a row.',
        'The hook must contain the title or thesis phrase verbatim.',
        'Verse 1 shows; Verse 2 deepens; do not restate the same image.',
      ],
    };
  }
}

function sectionsFor(structure: z.infer<typeof inputSchema>['structure']): string[] {
  switch (structure) {
    case 'verse-chorus':
      return ['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus'];
    case 'verse-pre-chorus':
      return [
        'Verse 1',
        'Pre-chorus',
        'Chorus',
        'Verse 2',
        'Pre-chorus',
        'Chorus',
        'Bridge',
        'Chorus',
      ];
    case 'aaba':
      return ['A (verse)', 'A (verse, vary last line)', 'B (bridge)', 'A (verse, resolved)'];
    case 'freeform':
      return ['Open-form — agent picks sections to serve the theme'];
  }
}

function rhymeFor(scheme: z.infer<typeof inputSchema>['rhymeScheme']): string {
  switch (scheme) {
    case 'aabb':
      return 'Paired couplets. Predictable — pairs well with upbeat / playful.';
    case 'abab':
      return 'Alternating. Classic pop cadence; let Line 4 resolve.';
    case 'abcb':
      return 'Only Line 2 and Line 4 rhyme. Reads as less "lyric-y", more conversational.';
    case 'free':
      return 'No strict scheme. Rely on assonance + meter for cohesion.';
  }
}
