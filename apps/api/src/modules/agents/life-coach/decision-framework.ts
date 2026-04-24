/**
 * Deterministic decision-making scaffold. Returns a structured template the
 * agent fills with user context in subsequent turns. No LLM call inside —
 * the framework itself is fixed.
 */

export interface DecisionFramework {
  prompt: string;
  stages: Array<{
    name: string;
    questions: string[];
  }>;
  tools: Array<{
    name: string;
    purpose: string;
    when: string;
  }>;
}

export function buildDecisionFramework(prompt: string): DecisionFramework {
  return {
    prompt,
    stages: [
      {
        name: 'Frame',
        questions: [
          'What is the actual decision? State it as a yes/no or a choice between named options.',
          "Whose decision is it — yours alone or shared? What happens if it's not made?",
          "What's the deadline (real, not imagined)?",
        ],
      },
      {
        name: 'Gather',
        questions: [
          'What do you already know? What assumptions are you leaning on?',
          'What information would change your mind? Can you get it in time?',
          'What does your past journal say when you faced something similar?',
        ],
      },
      {
        name: 'Score',
        questions: [
          'List each option. Rate on: alignment with values, reversibility, 2nd-order effects, energy cost.',
          'Which option most preserves future optionality?',
          "Which option are you avoiding because it's scary vs because it's wrong?",
        ],
      },
      {
        name: 'Commit',
        questions: [
          "What's the smallest next step that commits you to the chosen path?",
          'When will you revisit this decision (date) and on what signal?',
          "Write the 1-sentence story you'll tell in 6 months about why you chose this.",
        ],
      },
    ],
    tools: [
      {
        name: 'Pre-mortem',
        purpose: 'Imagine the decision failed in a year — list the causes.',
        when: 'Use when the downside is asymmetric or reversibility is low.',
      },
      {
        name: '10-10-10',
        purpose: 'How will you feel in 10 min, 10 months, 10 years?',
        when: 'Use when emotion is inflating short-term stakes.',
      },
      {
        name: 'Reversibility check',
        purpose: 'Is this a one-way or two-way door?',
        when: 'Default — run it on every non-trivial decision.',
      },
    ],
  };
}
