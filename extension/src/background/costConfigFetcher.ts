// src/background/costConfigFetcher.ts
// Fetches remote token pricing table, caching in storage with bundled fallback.

import { getCostConfig, setCostConfig } from '../utils/storage';
import bundledCosts from '../../config/costs.json';
import type { CostConfig } from '../utils/types';

const COST_CONFIG_URL = import.meta.env.VITE_COST_CONFIG_URL || 'https://raw.githubusercontent.com/guptalagan43/Fluxio/main/config/costs.json';

export async function fetchAndCacheCostConfig(): Promise<CostConfig> {
  try {
    const res = await fetch(COST_CONFIG_URL, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    const data = await res.json();
    if (data && data.models) {
      const config: CostConfig = {
        lastFetched: Date.now(),
        models: data.models,
      };
      await setCostConfig(config);
      return config;
    }
  } catch (err) {
    console.warn('[AI Token Tracker] Failed to fetch remote cost config, trying cached/bundled fallback:', err);
  }

  // Try cached version from storage
  const cached = await getCostConfig();
  if (cached) {
    return cached;
  }

  // Fallback to bundled config
  const defaultConfig: CostConfig = {
    lastFetched: Date.now(),
    models: bundledCosts.models,
  };
  await setCostConfig(defaultConfig);
  return defaultConfig;
}

export function calculateCost(tokens: number, modelName: string, role: 'user' | 'assistant', costConfig: CostConfig): number {
  const models = costConfig.models;
  const normalizedModel = modelName.toLowerCase();

  let ratePer1k = models['default']?.outputPer1k ?? 0.006;

  for (const [key, rates] of Object.entries(models)) {
    if (normalizedModel.includes(key.toLowerCase())) {
      ratePer1k = role === 'user' ? rates.inputPer1k : rates.outputPer1k;
      break;
    }
  }

  return (tokens / 1000) * ratePer1k;
}
