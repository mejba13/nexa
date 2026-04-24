import { z } from 'zod';

import { AGENT_TYPES } from '@nexa/types';

export const agentTypeSchema = z.enum(AGENT_TYPES);
export const agentSlugSchema = z.enum(['trading', 'music', 'content', 'life-coach']);
