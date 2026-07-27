// src/content/platforms/config.ts
// Platform configuration registry — defines DOM selectors and tokenizers for Tier 1 platforms.

import type { PlatformConfig } from '../../utils/types';

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    matchUrls: [
      '*://chatgpt.com/*',
      '*://chat.openai.com/*',
    ],
    selectors: {
      messageContainer: 'main div.flex.flex-col, main [role="presentation"]',
      userMessage: '[data-message-author-role="user"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      modelLabel: 'button[id^="radix-"] span, [data-testid="model-selector-button"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'claude',
    name: 'Claude',
    matchUrls: [
      '*://claude.ai/*',
    ],
    selectors: {
      messageContainer: 'div.flex-1.overflow-y-auto, fieldset + div',
      userMessage: '[data-is-streaming="false"] .font-user-message, div.font-user-message',
      assistantMessage: '.font-claude-message, [data-is-streaming="false"] .font-claude-message',
      modelLabel: 'button[aria-haspopup="menu"] span, div[class*="ModelSelector"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    matchUrls: [
      '*://gemini.google.com/*',
    ],
    selectors: {
      messageContainer: 'main-response-container, conversation-container, div.conversation-container',
      userMessage: 'user-query, .user-query-container',
      assistantMessage: 'model-response, .model-response-text',
      modelLabel: '.model-picker-button, .bard-mode-switcher-label',
    },
    tokenizerEncoding: 'cl100k_base',
  },
];

export function findPlatformConfig(url: string): PlatformConfig | null {
  for (const config of PLATFORM_CONFIGS) {
    for (const pattern of config.matchUrls) {
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\//g, '\\/');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(url)) {
        return config;
      }
    }
  }
  return null;
}
