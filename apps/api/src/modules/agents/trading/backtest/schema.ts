import { z } from 'zod';

const indicatorRefSchema = z.object({
  indicator: z.enum(['sma', 'ema', 'rsi', 'price', 'return']),
  period: z.number().int().positive().optional(),
  source: z.enum(['o', 'h', 'l', 'c']).optional(),
});

const conditionSchema = z.object({
  left: indicatorRefSchema,
  op: z.enum(['<', '<=', '>', '>=', '==']),
  right: z.union([z.number(), indicatorRefSchema]),
});

type RuleGroupShape = {
  combinator: 'all' | 'any';
  conditions: Array<z.infer<typeof conditionSchema> | RuleGroupShape>;
};

export const ruleGroupSchema: z.ZodType<RuleGroupShape> = z.lazy(() =>
  z.object({
    combinator: z.enum(['all', 'any']),
    conditions: z.array(z.union([conditionSchema, ruleGroupSchema])),
  }),
);

export const strategyRulesSchema = z.object({
  symbol: z.string().trim().min(1).max(32),
  entry: ruleGroupSchema,
  exit: ruleGroupSchema,
  sizing: z.object({
    type: z.literal('fixed_fraction'),
    fraction: z.number().min(0).max(1),
  }),
  fees: z
    .object({
      perTradePct: z.number().min(0).max(0.1),
    })
    .optional(),
});

export type StrategyRulesInput = z.infer<typeof strategyRulesSchema>;
