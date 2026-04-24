import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { zodToJsonSchema } from './zod-to-json-schema';

describe('zodToJsonSchema', () => {
  it('falls back to an empty object for non-object root', () => {
    const out = zodToJsonSchema(z.string());
    expect(out).toEqual({ type: 'object', properties: {} });
  });

  it('extracts required vs optional fields', () => {
    const schema = z.object({
      a: z.string(),
      b: z.number().optional(),
      c: z.boolean(),
    });
    const out = zodToJsonSchema(schema);
    expect(out.properties).toMatchObject({
      a: { type: 'string' },
      b: { type: 'number' },
      c: { type: 'boolean' },
    });
    // Required must include only non-optional keys.
    const required = (out as unknown as { required?: string[] }).required ?? [];
    expect(required.sort()).toEqual(['a', 'c']);
  });

  it('treats default and nullable wrappers as their inner type', () => {
    const schema = z.object({
      page: z.number().default(1),
      tag: z.string().nullable(),
    });
    const out = zodToJsonSchema(schema);
    expect(out.properties).toMatchObject({
      page: { type: 'number' },
      tag: { type: 'string' },
    });
  });

  it('handles enums and arrays', () => {
    const schema = z.object({
      mode: z.enum(['fast', 'slow']),
      tags: z.array(z.string()),
    });
    const out = zodToJsonSchema(schema);
    expect(out.properties).toMatchObject({
      mode: { type: 'string', enum: ['fast', 'slow'] },
      tags: { type: 'array', items: { type: 'string' } },
    });
  });
});
