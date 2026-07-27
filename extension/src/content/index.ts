// src/content/index.ts
// Content script entry point — injected into supported AI platform pages.
// Per rules.md Rule 3.3: only imports from utils/types, utils/constants,
// content/platforms/config, and content/platforms/scraper.

// Stub — no platform config yet. Implemented in Phase 2.
// In Phase 2, this file will:
// 1. Import platform configs from platforms/config.ts
// 2. Match current URL against platform matchUrls
// 3. Call initScraper(platformConfig) for the matching platform
// 4. Handle SPA navigation detection via popstate + pushState override

console.info('[AI Token Tracker] Content script loaded — awaiting platform config (Phase 2).');
