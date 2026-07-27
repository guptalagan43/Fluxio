// src/background/suggestionEngine.ts
// Pure task classification function for model recommendations.
// Per PRD Section 8.5 & architecture.md Section 4.4 — no storage reads, fully testable.

import type { SuggestionResult, Prefs } from '../utils/types';
import { estimateTokens } from './tokenizer';

const DEFAULT_PREFERRED_MODELS: Prefs['preferredModels'] = {
  quickQA: 'gpt-4o-mini',
  code: 'claude-sonnet',
  longContext: 'gemini-1.5-pro',
  creative: 'claude-sonnet',
  research: 'gpt-4o',
};

const CATEGORY_NAMES: Record<string, string> = {
  quickQA: 'Quick Q&A',
  code: 'Code',
  longContext: 'Long Context',
  creative: 'Creative',
  research: 'Research',
};

const CATEGORY_TIERS: Record<string, string> = {
  quickQA: 'fast / cheap',
  code: 'strong reasoning',
  longContext: 'high context window',
  creative: 'balanced mid-tier',
  research: 'strong reasoning',
};

const CATEGORY_HINTS: Record<string, string> = {
  quickQA: 'This looks like a simple question — a faster model gives a similar answer for ~10× less cost.',
  code: 'This looks like a coding task — a reasoning-focused model works best here.',
  longContext: 'This prompt includes extensive text — a model with a large context window is recommended.',
  creative: 'Creative writing tasks perform well on balanced, expressive mid-tier models.',
  research: 'Research and analysis tasks benefit from strong reasoning models.',
};

export function classifyTask(
  text: string,
  sessionTokens: number,
  budgetRemainingUSD: number,
  weeklyLimitUSD = 5.0,
  preferredModels: Prefs['preferredModels'] = DEFAULT_PREFERRED_MODELS
): SuggestionResult {
  const lowerText = text.toLowerCase();
  const tokenCount = estimateTokens(text);

  const scores = {
    quickQA: 0,
    code: 0,
    longContext: 0,
    creative: 0,
    research: 0,
  };

  // ── 1. Quick Q&A Scoring ──────────────────────────────────────────────
  if (tokenCount < 100) scores.quickQA += 3;
  if (text.trim().endsWith('?')) scores.quickQA += 2;
  const quickQAKeywords = ['what is', 'who is', 'when did', 'where is', 'define', 'meaning', 'how many', 'capitol of'];
  quickQAKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) scores.quickQA += 1;
  });

  // ── 2. Code Scoring ──────────────────────────────────────────────────
  if (text.includes('`') || text.includes('```')) scores.code += 3;
  const codeKeywords = ['function', 'class', 'bug', 'error', 'debug', 'syntax', 'compile', 'import', 'return', 'const', 'let', 'var', 'def ', 'public ', 'private '];
  codeKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) scores.code += 2;
  });

  // ── 3. Long-Context Scoring ─────────────────────────────────────────
  if (tokenCount > 500 || sessionTokens > 4000) scores.longContext += 3;
  const longCtxKeywords = ['summarize', 'document', 'file', 'entire', 'paste', 'pdf', 'article', 'essay', 'transcript', 'attached'];
  longCtxKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) scores.longContext += 2;
  });

  // ── 4. Creative Scoring ─────────────────────────────────────────────
  const creativeKeywords = ['write a', 'story', 'poem', 'essay', 'script', 'draft', 'compose', 'character', 'plot', 'rhyme', 'novel'];
  creativeKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) scores.creative += 2;
  });

  // ── 5. Research Scoring ─────────────────────────────────────────────
  const researchKeywords = ['explain', 'compare', 'pros and cons', 'analyse', 'analysis', 'difference between', 'tradeoffs', 'evaluate', 'benchmark'];
  researchKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) scores.research += 2;
  });

  // Determine winner
  type Category = 'quickQA' | 'code' | 'longContext' | 'creative' | 'research';
  let winningCategory: Category = 'quickQA';
  let maxScore = scores.quickQA;

  const categories: Category[] = ['code', 'longContext', 'research', 'creative'];
  for (const cat of categories) {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      winningCategory = cat;
    }
  }

  // Check budget override: remaining budget < 20% of weekly limit
  const isBudgetLow = budgetRemainingUSD < weeklyLimitUSD * 0.20;

  if (isBudgetLow) {
    return {
      category: 'quickQA',
      tier: CATEGORY_TIERS['quickQA']!,
      recommendedModel: preferredModels.quickQA || 'gpt-4o-mini',
      hint: 'Budget running low — a lighter model saves cost while keeping you within budget.',
      budgetWarning: true,
    };
  }

  return {
    category: winningCategory,
    tier: CATEGORY_TIERS[winningCategory]!,
    recommendedModel: preferredModels[winningCategory] || DEFAULT_PREFERRED_MODELS[winningCategory],
    hint: CATEGORY_HINTS[winningCategory]!,
    budgetWarning: false,
  };
}
