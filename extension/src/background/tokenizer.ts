// src/background/tokenizer.ts
// js-tiktoken wrapper with encoder instance caching.
// Per architecture.md Section 5.3: tokenizer is cached in memory as initialization is expensive.

import { getEncoding, type Tiktoken } from 'js-tiktoken';

const encoderCache = new Map<string, Tiktoken>();

export function estimateTokens(text: string, encodingName = 'cl100k_base'): number {
  if (!text || !text.trim()) {
    return 0;
  }

  try {
    let encoder = encoderCache.get(encodingName);
    if (!encoder) {
      encoder = getEncoding(encodingName as any);
      encoderCache.set(encodingName, encoder);
    }
    return encoder.encode(text).length;
  } catch (err) {
    console.error(`[AI Token Tracker] Tokenizer error with encoding ${encodingName}, falling back to word count estimate:`, err);
    // Fallback: 1 token ~ 4 characters or ~0.75 words
    return Math.ceil(text.length / 4);
  }
}
