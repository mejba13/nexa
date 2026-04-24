import type Anthropic from '@anthropic-ai/sdk';
import type { z, type ZodTypeAny } from 'zod';

/**
 * Minimal Zod → JSON Schema converter, enough for Anthropic tool input_schema.
 * Avoids pulling in zod-to-json-schema as a full dep; extend as new Zod types
 * are actually used by tools.
 */
export function zodToJsonSchema(schema: ZodTypeAny): Anthropic.Tool.InputSchema {
  const shape = convert(schema);
  if (shape.type !== 'object') {
    return { type: 'object', properties: {} };
  }
  return shape as Anthropic.Tool.InputSchema;
}

function convert(schema: ZodTypeAny): Record<string, unknown> {
  const def = schema._def as { typeName: string; [k: string]: unknown };
  const typeName = def.typeName;

  switch (typeName) {
    case 'ZodString':
      return { type: 'string', ...(def.description ? { description: def.description } : {}) };
    case 'ZodNumber':
      return { type: 'number', ...(def.description ? { description: def.description } : {}) };
    case 'ZodBoolean':
      return { type: 'boolean' };
    case 'ZodLiteral':
      return { const: def.value };
    case 'ZodEnum':
      return { type: 'string', enum: def.values };
    case 'ZodArray':
      return { type: 'array', items: convert(def.type as ZodTypeAny) };
    case 'ZodOptional':
    case 'ZodNullable':
    case 'ZodDefault':
      return convert(def.innerType as ZodTypeAny);
    case 'ZodObject': {
      const raw = (schema as z.ZodObject<z.ZodRawShape>).shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(raw)) {
        const v = value as ZodTypeAny;
        properties[key] = convert(v);
        if (!v.isOptional()) required.push(key);
      }
      return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {}),
      };
    }
    default:
      return {};
  }
}
