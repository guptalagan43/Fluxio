// src/content/platforms/config.ts
// Platform configuration registry — defines DOM selectors and tokenizers for all supported platforms.
// Tier 1: ChatGPT, Claude, Gemini (primary targets)
// Tier 2: Grok, DeepSeek, Mistral, HuggingChat, Poe, Qwen
// Tier 3: Groq, You.com, Kimi, Pi, OpenRouter, Cohere, Character.AI, Bing

import type { PlatformConfig } from '../../utils/types';

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  // ── Tier 1 ──────────────────────────────────────────────────────────

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

  // ── Tier 2 ──────────────────────────────────────────────────────────

  {
    id: 'grok',
    name: 'Grok',
    matchUrls: [
      '*://grok.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="conversation"], main',
      userMessage: 'div[class*="user-message"], div[data-role="user"]',
      assistantMessage: 'div[class*="assistant-message"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model-name"], span[class*="ModelLabel"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    matchUrls: [
      '*://chat.deepseek.com/*',
    ],
    selectors: {
      messageContainer: 'div.chat-messages, div[class*="ChatContainer"]',
      userMessage: 'div[class*="user"], div[data-role="user"]',
      assistantMessage: 'div[class*="assistant"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model-selector"], span[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    matchUrls: [
      '*://chat.mistral.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="conversation"], main div[class*="messages"]',
      userMessage: 'div[data-role="user"], div[class*="UserMessage"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="AssistantMessage"]',
      modelLabel: 'div[class*="model-selector"], button[class*="ModelPicker"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    // Aggregator platform — attempts to extract underlying model name
    id: 'huggingchat',
    name: 'HuggingChat',
    matchUrls: [
      '*://huggingface.co/chat/*',
    ],
    selectors: {
      messageContainer: 'div[class*="conversation"], div.overflow-y-auto',
      userMessage: 'div[class*="user"], div.group\\/user',
      assistantMessage: 'div[class*="assistant"], div.group\\/assistant',
      modelLabel: 'div[class*="model-selector"], button[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    // Aggregator platform — attempts to extract underlying model name
    id: 'poe',
    name: 'Poe',
    matchUrls: [
      '*://poe.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="ChatMessages"], div[class*="chat-messages"]',
      userMessage: 'div[class*="HumanMessage"], div[class*="human-message"]',
      assistantMessage: 'div[class*="BotMessage"], div[class*="bot-message"]',
      modelLabel: 'div[class*="BotName"], p[class*="botName"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    matchUrls: [
      '*://chat.qwen.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat-container"], div[class*="messages"]',
      userMessage: 'div[class*="user-message"], div[data-role="user"]',
      assistantMessage: 'div[class*="assistant-message"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model"], span[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },

  // ── Tier 3 ──────────────────────────────────────────────────────────

  {
    id: 'groq',
    name: 'Groq',
    matchUrls: [
      '*://groq.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], main',
      userMessage: 'div[data-role="user"], div[class*="user"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="assistant"]',
      modelLabel: 'div[class*="model"], select[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'youcom',
    name: 'You.com',
    matchUrls: [
      '*://you.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], div[class*="conversation"]',
      userMessage: 'div[data-role="user"], div[class*="userQuery"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="aiResponse"]',
      modelLabel: 'div[class*="model-selector"], span[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    matchUrls: [
      '*://kimi.moonshot.cn/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], div[class*="conversation"]',
      userMessage: 'div[class*="user"], div[data-role="user"]',
      assistantMessage: 'div[class*="assistant"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'pi',
    name: 'Pi',
    matchUrls: [
      '*://pi.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], main',
      userMessage: 'div[data-role="user"], div[class*="human"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="ai-message"]',
      modelLabel: 'div[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    // Aggregator platform — attempts to extract underlying model name
    id: 'openrouter',
    name: 'OpenRouter',
    matchUrls: [
      '*://openrouter.ai/chat/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], div[class*="conversation"]',
      userMessage: 'div[data-role="user"], div[class*="user"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="assistant"]',
      modelLabel: 'div[class*="model-selector"], span[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    matchUrls: [
      '*://coral.cohere.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], main',
      userMessage: 'div[data-role="user"], div[class*="User"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="Bot"]',
      modelLabel: 'div[class*="model"], button[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'characterai',
    name: 'Character.AI',
    matchUrls: [
      '*://character.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], div[class*="messages"]',
      userMessage: 'div[data-role="user"], div[class*="human"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="char"]',
      modelLabel: 'div[class*="character-name"], span[class*="charName"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'bing',
    name: 'Bing Chat',
    matchUrls: [
      '*://bing.com/chat*',
    ],
    selectors: {
      messageContainer: 'cib-conversation, div[class*="conversation"]',
      userMessage: 'cib-message[source="user"], div[data-role="user"]',
      assistantMessage: 'cib-message[source="bot"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model"], div[class*="tone-selector"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'copilot',
    name: 'Copilot',
    matchUrls: [
      '*://copilot.microsoft.com/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], cib-conversation, main',
      userMessage: 'cib-message[source="user"], div[data-role="user"]',
      assistantMessage: 'cib-message[source="bot"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'meta',
    name: 'Meta AI',
    matchUrls: [
      '*://meta.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="chat"], main',
      userMessage: 'div[data-role="user"], div[class*="user"]',
      assistantMessage: 'div[data-role="assistant"], div[class*="assistant"]',
      modelLabel: 'div[class*="model"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    matchUrls: [
      '*://perplexity.ai/*',
    ],
    selectors: {
      messageContainer: 'div[class*="ConversationMessages"], div[class*="thread"]',
      userMessage: 'div[class*="UserQuery"], div[data-role="user"]',
      assistantMessage: 'div[class*="AnswerContainer"], div[data-role="assistant"]',
      modelLabel: 'div[class*="model-select"], button[class*="ModelSelector"]',
    },
    tokenizerEncoding: 'cl100k_base',
  },
];

// Map of all platform IDs to display names — used by popup for display
export const PLATFORM_NAMES: Record<string, string> = {};
for (const config of PLATFORM_CONFIGS) {
  PLATFORM_NAMES[config.id] = config.name;
}

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
