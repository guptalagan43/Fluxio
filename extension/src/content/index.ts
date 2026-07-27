// src/content/index.ts
// Content script entry point — injected into supported AI platform pages.
// Per rules.md Rule 3.3: only imports from utils/types, utils/constants,
// content/platforms/config, and content/platforms/scraper.

import { findPlatformConfig } from './platforms/config';
import { waitForElement, attachObserver, setupNavigationListener } from './platforms/scraper';

async function initScraperForCurrentPage(): Promise<void> {
  const currentUrl = window.location.href;
  const config = findPlatformConfig(currentUrl);

  if (!config) {
    return;
  }

  console.info(`[AI Token Tracker] Initializing scraper for ${config.name} (${config.id})`);

  try {
    const container = await waitForElement(config.selectors.messageContainer, 15000);
    if (container) {
      attachObserver(container, config);
    } else {
      console.warn(`[AI Token Tracker] Container for ${config.name} not found within timeout.`);
    }
  } catch (err) {
    console.error(`[AI Token Tracker] Error initializing scraper for ${config.name}:`, err);
  }
}

// Initial boot
initScraperForCurrentPage();

// Handle SPA route changes
setupNavigationListener(() => {
  initScraperForCurrentPage();
});
