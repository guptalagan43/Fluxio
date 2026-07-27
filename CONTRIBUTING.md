# Contributing to AI Token Tracker

Thank you for your interest in contributing to AI Token Tracker! We welcome contributions from the community.

---

## 🚀 How to Add Support for a New AI Platform

Adding support for a new AI platform requires **zero code logic changes** — simply add a configuration entry to [`extension/src/content/platforms/config.ts`](file:///D:/Projects/Fluxio%20Tockeniser/extension/src/content/platforms/config.ts).

### Step 1: Open `extension/src/content/platforms/config.ts`

Add a new `PlatformConfig` object to the `PLATFORM_CONFIGS` array:

```typescript
{
  id: 'my-platform',
  name: 'My Platform Name',
  matchUrls: [
    '*://myplatform.com/chat/*',
  ],
  selectors: {
    messageContainer: 'main div.messages-container',
    userMessage: 'div[data-role="user"]',
    assistantMessage: 'div[data-role="assistant"]',
    modelLabel: 'button.model-selector-span',
  },
  tokenizerEncoding: 'cl100k_base',
}
```

### Step 2: Add Match URL to `extension/manifest.json`

Add the URL pattern to the `content_scripts[0].matches` array in `extension/manifest.json`:

```json
"matches": [
  ...
  "*://myplatform.com/chat/*"
]
```

### Step 3: Test Locally

1. Build the extension: `cd extension && npm run build`
2. Load the `extension/dist` folder as an unpacked extension in Chrome (`chrome://extensions`).
3. Open your target platform in Chrome, send a message, and check the extension popup to verify token & cost tracking.

---

## 🛠 Project Structure

- `extension/` — Chrome Manifest V3 extension (React, Vite, TypeScript, `js-tiktoken`)
- `website/` — Companion web dashboard & landing page (React, Vite, TailwindCSS, Recharts)
- `backend/` — Express.js API & Prisma ORM backend (PostgreSQL, Nodemailer, JWT, express-rate-limit)

---

## 📜 Coding Guidelines & Rules

- **Zero-Border-Radius UI**: Follow `Docs/design.md` — sharp edges (`rounded-none`), IBM Plex Mono for numeric data, stone/amber color tokens.
- **Privacy First**: Raw prompt text is tokenized in-memory and discarded immediately. Never log or store raw prompt text.
- **Type Safety**: Avoid using `any`. Define interfaces in `types.ts` or schema definitions.

Thank you for contributing!
