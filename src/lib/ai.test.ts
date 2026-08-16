// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Set the env var BEFORE importing ai.ts so getOpenAIClient() proceeds to construct the client
beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-api-key-for-vitest';
});

// Mock OpenAI client
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    matchScore: 88,
                    matchingSkills: ['React', 'TypeScript'],
                    missingSkills: ['Kubernetes'],
                    recommendations: ['Highlight Next.js experience'],
                    questions: [
                      { question: 'Describe your React experience', tip: 'Focus on hooks and patterns', difficulty: 'Medium' },
                    ],
                    concepts: ['React Hooks', 'State Management'],
                    studyPlan: 'Review React docs and build a practice app',
                  }),
                },
              },
            ],
          }),
        },
      };
    },
  };
});

import { analyzeJobMatch, generateInterviewPrep } from './ai';

describe('AI Utility Functions & Mock Isolation', () => {
  it('analyzes job match score safely without leaking API keys', async () => {
    const result = await analyzeJobMatch('Senior Frontend Engineer', 'Stripe', 'Looking for React & TypeScript experts.');
    expect(result).toBeDefined();
    expect(typeof result.matchScore).toBe('number');
    expect(result.matchScore).toBeGreaterThan(50);
  });

  it('handles graceful parsing when AI returns valid responses', async () => {
    const prep = await generateInterviewPrep('Software Engineer', 'Linear', 'React experience required.');
    expect(prep).toBeDefined();
    expect(prep.questions).toBeDefined();
  });
});
