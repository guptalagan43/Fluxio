// src/content/platforms/scraper.ts
// Generic DOM scraper driven by PlatformConfig.
// Per architecture.md Section 5.2 — contains no platform-specific logic.

import type { PlatformConfig, ExtensionMessage, NewMessagePayload } from '../../utils/types';

let currentObserver: MutationObserver | null = null;
const processedElements = new WeakSet<Element>();

export function waitForElement(selector: string, timeoutMs = 10000): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      return resolve(existing);
    }

    let timer: number | null = null;
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        if (timer !== null) clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    timer = window.setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelector(selector));
    }, timeoutMs);
  });
}

function extractModelName(config: PlatformConfig): string {
  const el = document.querySelector(config.selectors.modelLabel);
  if (el && el.textContent) {
    const text = el.textContent.trim();
    if (text) return text;
  }
  return config.id;
}

function processMessageElement(el: Element, role: 'user' | 'assistant', config: PlatformConfig): void {
  if (processedElements.has(el)) return;
  processedElements.add(el);

  const text = (el as HTMLElement).innerText || el.textContent || '';
  if (!text.trim()) return;

  const model = extractModelName(config);
  const payload: NewMessagePayload = {
    platform: config.id,
    model,
    role,
    text,
    timestamp: Date.now(),
    tabId: 0, // Filled in background service worker via sender.tab.id
  };

  const message: ExtensionMessage = {
    type: 'NEW_MESSAGE',
    payload,
  };

  try {
    chrome.runtime.sendMessage(message);
  } catch (err) {
    console.error('[AI Token Tracker] Failed to send message to background worker:', err);
  }
}

export function attachObserver(container: Element, config: PlatformConfig): void {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }

  // Scan existing messages first
  const existingUsers = container.querySelectorAll(config.selectors.userMessage);
  existingUsers.forEach((el) => processMessageElement(el, 'user', config));

  const existingAssistants = container.querySelectorAll(config.selectors.assistantMessage);
  existingAssistants.forEach((el) => processMessageElement(el, 'assistant', config));

  currentObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as Element;

        if (el.matches(config.selectors.userMessage)) {
          processMessageElement(el, 'user', config);
        } else if (el.matches(config.selectors.assistantMessage)) {
          processMessageElement(el, 'assistant', config);
        } else {
          // Check descendants
          const userMatches = el.querySelectorAll(config.selectors.userMessage);
          userMatches.forEach((child) => processMessageElement(child, 'user', config));

          const assistantMatches = el.querySelectorAll(config.selectors.assistantMessage);
          assistantMatches.forEach((child) => processMessageElement(child, 'assistant', config));
        }
      });
    }
  });

  currentObserver.observe(container, { childList: true, subtree: true });
}

export function setupNavigationListener(onNavigate: () => void): void {
  window.addEventListener('popstate', onNavigate);

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    onNavigate();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    onNavigate();
  };
}
