# Architecture Document
## AI Token Tracker — Browser Extension & Web Platform

**Version:** 1.0  
**Last Updated:** July 2026  
**Companion Document:** prd.md v1.1

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture Diagram](#2-high-level-architecture-diagram)
3. [Component Responsibilities](#3-component-responsibilities)
4. [Key Data Flows](#4-key-data-flows)
   - 4.1 Token tracking flow (core loop)
   - 4.2 Email OTP authentication flow
   - 4.3 Cloud sync flow
   - 4.4 Model suggestion flow
   - 4.5 Budget notification flow
5. [Browser Extension — Deep Dive](#5-browser-extension--deep-dive)
   - 5.1 Manifest V3 architecture
   - 5.2 Content script layer
   - 5.3 Background service worker
   - 5.4 Storage architecture
   - 5.5 Popup UI
   - 5.6 Build pipeline
   - 5.7 Full folder & file structure
6. [Website — Deep Dive](#6-website--deep-dive)
   - 6.1 Component architecture
   - 6.2 Routing & auth guards
   - 6.3 API layer (Axios)
   - 6.4 State management
   - 6.5 Full folder & file structure
7. [Backend — Deep Dive](#7-backend--deep-dive)
   - 7.1 Layered architecture
   - 7.2 Middleware pipeline
   - 7.3 REST API specification
   - 7.4 Full folder & file structure
8. [Cross-Component Communication](#8-cross-component-communication)
9. [Database Design](#9-database-design)
10. [Tech Stack Reference](#10-tech-stack-reference)
11. [Build & Deployment Pipeline](#11-build--deployment-pipeline)
12. [Environment Variables](#12-environment-variables)
13. [Local Development Setup](#13-local-development-setup)

---

## 1. System Overview

The system consists of three independently deployable components that share a single backend:

| Component | What it is | Deployed at |
|---|---|---|
| **Browser Extension** | Manifest V3 extension for Chrome / Edge / Brave | Chrome Web Store / Edge Add-ons |
| **Website** | React SPA — landing page, auth, dashboard | Vercel |
| **Backend** | Node.js + Express REST API | Railway (or Render) |

The extension and the website share the same authentication system (email OTP → JWT). The extension stores data locally by default and optionally syncs to the backend. The website dashboard reads from the backend.

```
USERS
  │
  ├── install extension ──► Chrome Web Store / Edge Add-ons
  │                              │
  │                              ▼
  │                         Extension runs
  │                         on AI platform sites
  │
  └── visit website ──► yourwebsite.com (Vercel)
                              │
                              ├── landing / download page
                              ├── sign up / log in (OTP)
                              └── web dashboard (synced data)
                                        │
                                        ▼
                                   Backend API
                                (Railway / Render)
                                        │
                                        ├── Supabase PostgreSQL
                                        ├── Gmail SMTP (OTP email)
                                        └── Upstash Redis (rate limits)
```

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  SUPPORTED AI PLATFORM SITES                                         │
│  chatgpt.com · claude.ai · gemini.google.com · perplexity.ai · ...  │
└────────────────────────┬────────────────────────────────────────────┘
                         │  content scripts injected by extension
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER  (Chrome / Edge / Brave)                                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  EXTENSION  (Manifest V3)                                    │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  CONTENT SCRIPTS  (one per active tab)              │    │   │
│  │  │  · attach MutationObserver to chat container        │    │   │
│  │  │  · extract text on each new message node            │    │   │
│  │  │  · detect active model from platform selector       │    │   │
│  │  │  · post message to background via sendMessage()     │    │   │
│  │  └───────────────────────┬─────────────────────────────┘    │   │
│  │                          │  chrome.runtime.sendMessage()     │   │
│  │                          ▼                                   │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  BACKGROUND SERVICE WORKER                          │    │   │
│  │  │  · receive messages from content scripts            │    │   │
│  │  │  · tokenize text (js-tiktoken)                      │    │   │
│  │  │  · write session + rollup data to storage           │    │   │
│  │  │  · check budget thresholds (chrome.alarms)          │    │   │
│  │  │  · fire notifications (chrome.notifications)        │    │   │
│  │  │  · run suggestion engine (classifyTask)             │    │   │
│  │  │  · sync data to backend (when enabled)              │    │   │
│  │  │  · fetch remote cost config daily                   │    │   │
│  │  └──────────┬──────────────────────┬───────────────────┘    │   │
│  │             │                      │                         │   │
│  │             ▼                      ▼                         │   │
│  │  ┌─────────────────┐   ┌──────────────────────────────┐     │   │
│  │  │ chrome.storage  │   │  POPUP UI  (React)            │     │   │
│  │  │ .local          │◄──│  · reads from storage         │     │   │
│  │  │                 │   │  · session panel               │     │   │
│  │  │ sessions        │   │  · budget bar                  │     │   │
│  │  │ daily rollups   │   │  · suggestion chip             │     │   │
│  │  │ weekly budget   │   │  · context warning banner      │     │   │
│  │  │ prefs + JWT     │   │  · settings panel              │     │   │
│  │  └─────────────────┘   └──────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────┬───────────────────────┘
                                              │ HTTPS
                    ┌─────────────────────────┴───────────────────────┐
                    │  CLOUDFLARE  (free tier)                         │
                    │  · DDoS protection  · WAF  · CDN  · SSL         │
                    └──────────┬──────────────────────┬───────────────┘
                               │                      │
               ┌───────────────▼──────┐   ┌───────────▼──────────────┐
               │  WEBSITE             │   │  BACKEND API              │
               │  Vercel              │   │  Railway / Render         │
               │                      │   │                           │
               │  /                   │   │  POST /auth/request-otp  │
               │  /signup             │   │  POST /auth/verify-otp   │
               │  /login              │   │  POST /auth/logout        │
               │  /verify-otp         │   │  GET  /auth/me            │
               │  /dashboard ─────────┼───►  GET  /api/usage          │
               │  /settings  ─────────┼───►  PUT  /api/settings       │
               │  /privacy-policy     │   │  POST /api/sync           │
               │  /terms              │   │  DELETE /api/data         │
               │  /cookies            │   │  GET  /health             │
               └──────────────────────┘   └───────────┬──────────────┘
                                                       │
                                        ┌──────────────┼──────────────┐
                                        │              │              │
                              ┌─────────▼──┐  ┌────────▼──┐  ┌──────▼──────┐
                              │ Supabase   │  │  Gmail    │  │  Upstash    │
                              │ PostgreSQL │  │  SMTP     │  │  Redis      │
                              │ (database) │  │  (OTP)    │  │  (rate lim) │
                              └────────────┘  └───────────┘  └─────────────┘
```

---

## 3. Component Responsibilities

### Browser Extension
- **Owns:** All real-time tracking logic, tokenization, budget management, model suggestions.
- **Primary data store:** `chrome.storage.local` (local-first, privacy-friendly).
- **Does not own:** Authentication UI, historical analytics, legal pages.
- **Communicates with:** AI platform sites (DOM), Background worker (messages), Backend (optional sync).

### Website
- **Owns:** Landing/marketing page, authentication UI (OTP flow), web dashboard, settings UI, legal pages.
- **Does not own:** Token tracking, notifications, local storage.
- **Communicates with:** Backend API only (via Axios with JWT cookie).

### Backend
- **Owns:** OTP generation/verification, JWT issuance, usage data storage, settings persistence.
- **Does not own:** Token tracking logic, DOM interaction, UI rendering.
- **Communicates with:** PostgreSQL (Prisma), Gmail SMTP (Nodemailer), Redis (rate limiter store).

---

## 4. Key Data Flows

### 4.1 Token Tracking Flow (Core Loop)

This is the primary loop — runs on every new message on every supported AI platform.

```
User types a message and presses send
         │
         ▼
AI platform DOM updates
(new message node added to chat container)
         │
         ▼
MutationObserver callback fires in content script
         │
         ├─► Read text content of new node
         ├─► Read model name from platform's model selector
         ├─► Identify role: 'user' or 'assistant'
         │
         ▼
chrome.runtime.sendMessage({
  type: 'NEW_MESSAGE',
  payload: { platform, model, role, text, timestamp }
})
         │
         ▼
Background service worker receives message
         │
         ├─► tokenize(text) via js-tiktoken → estimatedTokens
         ├─► costPer1k = getCostFromConfig(platform, model, role)
         ├─► estimatedCostUSD = (estimatedTokens / 1000) * costPer1k
         │
         ├─► Write to session record in chrome.storage.local:
         │     session.turns.push({ role, tokens, cost, ts })
         │     session.totalTokens += estimatedTokens
         │     session.totalCostUSD += estimatedCostUSD
         │     session.lastActive = Date.now()
         │
         ├─► Update daily rollup:
         │     day[today].totalTokens += estimatedTokens
         │     day[today].totalCostUSD += estimatedCostUSD
         │     day[today].byPlatform[platform].tokens += estimatedTokens
         │
         ├─► Update weekly budget:
         │     budget.currentWeekUSD += estimatedCostUSD
         │
         ├─► Run classifyTask(text, session.totalTokens, budget.remaining)
         │     → store suggestion result in session record
         │
         ├─► Check context-length warning thresholds (6k, 15k)
         │     → update session.warned6k / warned15k if crossed
         │
         └─► Budget check (also runs on chrome.alarms every 5 min):
               if currentWeekUSD / weeklyLimitUSD >= 0.5 && !notified50
                 → fire chrome.notification + set notified50 = true
               (repeat for 80%, 100%)
```

### 4.2 Email OTP Authentication Flow

```
────────────────────────────────────────────────────────────────────
SCENARIO A: User logs in from the Extension Popup
────────────────────────────────────────────────────────────────────

User clicks "Sign In" in popup
         │
         ▼
Extension opens a new browser tab:
  chrome.tabs.create({ url: 'https://yourwebsite.com/login?source=extension' })
         │
         ▼
User is on /login page in the new tab
  → Enters email → clicks "Send Code"
         │
         ▼
Website: POST /auth/request-otp { email }
         │
         ▼
Backend:
  1. Validate email format (zod)
  2. Check rate limits (IP + email counters)
  3. Generate 6-digit OTP: Math.floor(100000 + Math.random() * 900000)
  4. Hash OTP: bcrypt.hash(otp, 10)
  5. Upsert otp_records row: { email, otpHash, expiresAt: now+5min, used: false, attempts: 0 }
  6. Send email via Nodemailer (Gmail SMTP)
  7. Return 200 { message: 'OTP sent' }
         │
         ▼
User receives email, enters 6-digit OTP on /verify-otp
  → Website: POST /auth/verify-otp { email, otp }
         │
         ▼
Backend:
  1. Validate inputs (zod)
  2. Look up OTP record: WHERE email = ? AND used = false AND expiresAt > NOW()
  3. If not found → 400 'Invalid or expired code'
  4. If attempts >= 5 → 429 'Too many attempts'
  5. Increment attempts counter (atomic update)
  6. bcrypt.compare(otp, otpHash) → if false → 401 'Incorrect code'
  7. Mark record as used: UPDATE SET used = true
  8. Upsert user: INSERT INTO users (email) ON CONFLICT DO NOTHING
  9. Issue JWT: jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: '7d' })
  10. Return 200 { token, user: { id, email } }
         │
         ▼
Website:
  - Sets cookie: Set-Cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
  - If source=extension: calls chrome.runtime.sendMessage(EXTENSION_ID, { type: 'AUTH_SUCCESS', token })
  - Redirects to /dashboard (or /verify-otp stays open until extension confirms receipt)
         │
         ▼
Extension background worker:
  - Receives 'AUTH_SUCCESS' message from website tab
  - Stores JWT: chrome.storage.local.set({ jwt: token })
  - Closes the login tab: chrome.tabs.remove(tabId)
  - Popup updates to show logged-in state

────────────────────────────────────────────────────────────────────
SCENARIO B: User logs in directly on the Website
────────────────────────────────────────────────────────────────────

Same flow as above, but:
  - No 'source=extension' parameter
  - No sendMessage() call to extension
  - After cookie is set, redirect to /dashboard
```

### 4.3 Cloud Sync Flow

```
chrome.alarms fires every 10 minutes
         │
         ▼
syncManager.ts: checkAndSync()
         │
         ├─► Is sync enabled? (prefs.syncEnabled) → if false, return
         ├─► Is JWT present? → if false, queue for later, show re-auth nudge
         ├─► Are there pending events? → if none, return
         │
         ▼
Gather events since last sync:
  pendingEvents = prefs.pendingSyncEvents
  + new turns from sessions since prefs.lastSyncAt
         │
         ▼
POST /api/sync
  Authorization: Bearer <jwt>
  Body: { events: [...] }   // max 500 events per batch
         │
         ▼
Backend:
  1. Verify JWT → extract user.id
  2. Validate body (zod, max 500 events)
  3. Prisma: createMany with skipDuplicates (unique on userId+sessionId+occurredAt)
  4. Return 200 { synced: N }
         │
         ├─ SUCCESS:
         │     prefs.lastSyncAt = Date.now()
         │     prefs.pendingSyncEvents = []
         │     chrome.storage.local.set({ prefs })
         │
         └─ FAILURE (network / 5xx):
               prefs.pendingSyncEvents = [...existing, ...newEvents]
               prefs.syncFailCount += 1
               if (syncFailCount >= 3) → show in-popup re-auth notice
               chrome.storage.local.set({ prefs })
               // retry on next 10-min alarm
```

### 4.4 Model Suggestion Flow

```
Background worker receives NEW_MESSAGE (role: 'user')
         │
         ▼
classifyTask(text, session.totalTokens, budget.remainingUSD)
         │
         ├─► Score each category:
         │     quickQA:  +3 if len<100tokens, +2 if ends with '?', +1 if factual keywords
         │     code:     +3 if has backticks, +2 per code keyword (function/class/etc)
         │     longCtx:  +3 if len>500tokens, +2 per longctx keyword (summarize/document/etc)
         │     creative: +2 per creative keyword (story/poem/essay/etc)
         │     research: +2 per research keyword (explain/compare/analyse/etc)
         │
         ├─► winningCategory = argmax(scores)
         │
         ├─► If budget.remainingUSD < (weeklyLimitUSD * 0.20):
         │     override to 'quickQA' tier with budget-warning note
         │
         ├─► Look up preferred model for winning tier from prefs.preferredModels
         │
         └─► Return {
               category: 'code',
               tier: 'strong',
               recommendedModel: 'claude-sonnet',
               hint: 'This looks like a coding task — a reasoning-focused model works best here.',
               budgetWarning: false
             }
         │
         ▼
Store in session:
  session.lastSuggestion = suggestionResult
         │
         ▼
Popup reads session.lastSuggestion from storage
  → renders SuggestionChip component
```

### 4.5 Budget Notification Flow

```
chrome.alarms('budget-check') fires every 5 minutes
         │
         ▼
budgetManager.checkThresholds()
         │
         ▼
Read from chrome.storage.local:
  { budget: { weeklyLimitUSD, currentWeekUSD, notified50, notified80,
              notified100, notificationsEnabled, weekStartDate } }
         │
         ├─► Is it a new week? (weekStartDate < last Monday 00:00)
         │     → reset: currentWeekUSD=0, notified50/80/100=false
         │         weekStartDate = thisMonday.toISOString()
         │
         ├─► If !notificationsEnabled → return
         │
         ├─► ratio = currentWeekUSD / weeklyLimitUSD
         │
         ├─► ratio >= 0.50 && !notified50:
         │     chrome.notifications.create('budget-50', {
         │       type: 'basic', iconUrl: '/icons/icon-48.png',
         │       title: 'AI Token Tracker',
         │       message: `You're at 50% of your $${weeklyLimitUSD} weekly budget.`
         │     })
         │     set notified50 = true
         │
         ├─► ratio >= 0.80 && !notified80 → (similar, 80% message)
         │
         └─► ratio >= 1.00 && !notified100 → (similar, 100% message)
```

---

## 5. Browser Extension — Deep Dive

### 5.1 Manifest V3 Architecture

```json
// manifest.json
{
  "manifest_version": 3,
  "name": "AI Token Tracker",
  "version": "1.0.0",
  "description": "Track AI token usage and costs across 15+ platforms.",
  "icons": {
    "16":  "icons/icon-16.png",
    "32":  "icons/icon-32.png",
    "48":  "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },

  "action": {
    "default_popup": "popup/index.html",
    "default_icon":  "icons/icon-48.png"
  },

  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": [
        "*://chatgpt.com/*",
        "*://chat.openai.com/*",
        "*://claude.ai/*",
        "*://gemini.google.com/*",
        "*://perplexity.ai/*",
        "*://copilot.microsoft.com/*",
        "*://meta.ai/*",
        "*://grok.com/*",
        "*://chat.deepseek.com/*",
        "*://chat.mistral.ai/*",
        "*://huggingface.co/chat/*",
        "*://poe.com/*",
        "*://chat.qwen.ai/*",
        "*://groq.com/*",
        "*://you.com/*",
        "*://kimi.moonshot.cn/*",
        "*://pi.ai/*",
        "*://openrouter.ai/chat/*",
        "*://coral.cohere.com/*",
        "*://character.ai/*",
        "*://bing.com/chat*"
      ],
      "js": ["content/index.js"],
      "run_at": "document_idle"
    }
  ],

  "permissions": [
    "storage",
    "alarms",
    "notifications",
    "tabs"
  ],

  "externally_connectable": {
    "matches": ["https://yourwebsite.com/*"]
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },

  "web_accessible_resources": [
    {
      "resources": ["onboarding/index.html"],
      "matches":   ["<all_urls>"]
    }
  ]
}
```

### 5.2 Content Script Layer

The content script uses a single generic scraper driven by the platform config.
It does not contain any platform-specific logic itself.

```
Content script lifecycle per tab:
─────────────────────────────────────────────────────
1. Document becomes idle (run_at: document_idle)
2. content/index.ts imports platforms from config.ts
3. Match current URL against platform matchUrls patterns
4. If match found → call initScraper(platformConfig)
5. initScraper:
     a. Wait for messageContainer selector to appear in DOM
        (uses waitForElement() with MutationObserver + timeout)
     b. Attach a MutationObserver to the container
     c. Observer watches for new child nodes
     d. On new node:
        - Check if it matches userMessage or assistantMessage selector
        - Extract innerText (strip markdown/code fences for length, keep raw for tokenization)
        - Extract model name from modelLabel selector (cache per tab, re-read on mutation)
        - Send to background via chrome.runtime.sendMessage()
     e. On page navigation (SPA route change):
        - Many AI sites are SPAs, so watch for URL change via popstate + pushState override
        - On navigation, call initScraper() again to re-attach observer to new chat container
```

### 5.3 Background Service Worker

```
Background worker message router:
─────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'NEW_MESSAGE':    → handleNewMessage(message.payload)
    case 'GET_SESSION':    → sendResponse(getActiveSession(sender.tab.id))
    case 'GET_SUMMARY':    → sendResponse(getTodaySummary())
    case 'AUTH_SUCCESS':   → handleAuthSuccess(message.token)
    case 'DISMISS_SUGGESTION': → dismissSuggestion(message.sessionId)
    case 'DISMISS_WARNING':    → dismissWarning(message.sessionId)
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'budget-check':   → budgetManager.checkThresholds()
    case 'sync':           → syncManager.checkAndSync()
    case 'cost-config':    → costConfigFetcher.fetchAndCache()
    case 'session-cleanup':→ cleanupInactiveSessions()
  }
})

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.alarms.create('budget-check',   { periodInMinutes: 5 })
    chrome.alarms.create('sync',           { periodInMinutes: 10 })
    chrome.alarms.create('cost-config',    { periodInMinutes: 1440 }) // daily
    chrome.alarms.create('session-cleanup',{ periodInMinutes: 60 })
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/index.html') })
  }
})
```

### 5.4 Storage Architecture

Storage is the single source of truth for the extension.
All reads and writes go through typed helper functions in `utils/storage.ts`.

```
chrome.storage.local layout:

KEY                     TYPE            DESCRIPTION
──────────────────────────────────────────────────────────────────────
jwt                     string|null     JWT from backend (or null if logged out)
prefs                   PrefsObject     User preferences, sync state, pending events
budget                  BudgetObject    Weekly budget state + notification flags
costConfig              CostConfig      Cached remote cost table + lastFetched timestamp
lastSuggestion          Suggestion      Most recent model suggestion result
session:<tabId>         SessionObject   Active session per open tab
day:<YYYY-MM-DD>        DayRollup       Daily aggregated token/cost totals
──────────────────────────────────────────────────────────────────────

Session key uses tabId (not sessionId) so it's trivially found when a message
arrives from a content script (which knows its tabId via sender.tab.id).

When a tab is closed (chrome.tabs.onRemoved):
  - Read session:<tabId> from storage
  - Save it to a permanent key session:<sessionId> (the uuid) for history
  - Delete session:<tabId>

Session turns array is capped at 500 entries.
Entries 501+ are aggregated: the oldest 100 turns are summed into a single
{ role: 'aggregate', tokens: N, cost: N, ts: firstTs } entry.
This keeps storage under the 5MB quota.
```

### 5.5 Popup UI

```
Popup renders from chrome.storage.local only (no network calls):

App.tsx
├── useStorage() hook — subscribes to chrome.storage.onChanged
│     auto-re-renders popup when storage updates (live counter effect)
│
├── Header
│     PlatformIcon (from active session) + ModelName
│
├── SessionPanel
│     ~{totalTokens} tokens  |  ~${totalCostUSD.toFixed(4)}  |  {duration}
│
├── SuggestionChip  (if lastSuggestion exists and !dismissed)
│     [{category}] → {recommendedModel}
│     ExpandedHint (shown on click)
│
├── ContextWarningBanner  (if session.warned6k && !dismissed)
│     "This chat is getting long..."
│     [How to summarize]  [Dismiss]
│
├── BudgetBar
│     Progress bar (0–100%), color-coded
│     ${currentWeekUSD.toFixed(2)} / ${weeklyLimitUSD} this week
│
├── TodaySummary
│     Today: ~{todayTokens} tokens · ~${todayCost}
│     Platforms used: [icons]
│
├── Footer
│     [View Dashboard ↗]     [⚙ Settings]     [Sign In / Sign Out]
│
└── SettingsPanel  (shown when ⚙ clicked, rendered inline below footer)
      Weekly budget: [____] USD  [Save]
      Notifications: [✓] 50%  [✓] 80%  [✓] 100%
      Cloud sync: [toggle]
      Tracked platforms: [list with on/off toggles]
```

### 5.6 Build Pipeline

```
Tool: Vite + vite-plugin-web-extension + TypeScript

Input:                          Output (dist/):
────────────────────────────    ────────────────────────────
src/background/index.ts    →   background/index.js   (ESM)
src/content/index.ts       →   content/index.js      (IIFE)
src/popup/index.html       →   popup/index.html
src/popup/main.tsx         →   popup/main.js         (React bundle)
src/onboarding/index.html  →   onboarding/index.html
manifest.json (source)     →   manifest.json         (processed)
public/icons/              →   icons/
config/costs.json          →   config/costs.json     (bundled fallback)

Build commands:
  npm run dev    → watch mode, output to dist/, load unpacked in Chrome
  npm run build  → production build, tree-shaken + minified
  npm run zip    → build + zip dist/ → ai-token-tracker-v1.0.0.zip
                   (zip is what you upload to Chrome Web Store)

Note on content script bundling:
  Content scripts must be IIFE (not ESM) because they run in page context.
  vite-plugin-web-extension handles this automatically.
  Background worker IS ESM (Manifest V3 supports ESM service workers).
```

### 5.7 Full Folder & File Structure

```
extension/
│
├── manifest.json                       Extension manifest (source, processed by Vite)
├── package.json
├── tsconfig.json
├── vite.config.ts                      Vite + vite-plugin-web-extension config
├── .env                                Local dev env vars (never committed)
├── .gitignore
│
├── config/
│   └── costs.json                      Bundled fallback token cost table
│                                       (also hosted on GitHub for remote fetch)
│
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
│
└── src/
    │
    ├── background/                     SERVICE WORKER
    │   ├── index.ts                    Entry: registers alarms, message router, onInstalled
    │   ├── tokenizer.ts                Wraps js-tiktoken; exposes estimateTokens(text, encoding)
    │   │                               Caches encoder instance (expensive to init)
    │   ├── budgetManager.ts            checkThresholds(), resetWeeklyBudget()
    │   │                               Reads/writes budget from storage
    │   ├── suggestionEngine.ts         classifyTask(text, sessionTokens, budgetRemaining)
    │   │                               Pure function — no storage reads, fully testable
    │   ├── syncManager.ts              checkAndSync(), buildSyncPayload(), handleSyncResult()
    │   │                               Reads pending events from storage, POSTs to /api/sync
    │   ├── costConfigFetcher.ts        fetchAndCache() — fetches GitHub raw JSON
    │   │                               Falls back to cached version, then to bundled default
    │   └── sessionManager.ts           handleNewMessage(), getActiveSession()
    │                                   writeSessionTurn(), updateDailyRollup()
    │                                   cleanupInactiveSessions()
    │
    ├── content/                        CONTENT SCRIPTS
    │   ├── index.ts                    Entry: match URL to platform config, call initScraper()
    │   │                               Also handles SPA navigation detection
    │   └── platforms/
    │       ├── config.ts               Platform config registry — all 20 platforms defined here
    │       │                           Each entry: { id, name, matchUrls, selectors, tokenizerEncoding }
    │       └── scraper.ts              Generic scraper: waitForElement(), attachObserver()
    │                                   extractMessage(), extractModel()
    │                                   Reads config, sends chrome.runtime.sendMessage
    │
    ├── popup/                          POPUP UI (React)
    │   ├── index.html                  Popup HTML shell
    │   ├── main.tsx                    React root (ReactDOM.createRoot)
    │   ├── App.tsx                     Root component, reads storage, renders layout
    │   ├── popup.css                   Base styles (Tailwind CDN or inline CSS)
    │   │
    │   ├── hooks/
    │   │   ├── useStorage.ts           Subscribes to chrome.storage.onChanged
    │   │   │                           Returns live storage snapshot, triggers re-render on change
    │   │   └── useActiveSession.ts     Derives active session from storage + current tab
    │   │
    │   └── components/
    │       ├── Header.tsx              Platform icon + model name
    │       ├── SessionPanel.tsx        Live token counter, cost, duration
    │       ├── BudgetBar.tsx           Progress bar + current spend display
    │       ├── SuggestionChip.tsx      Task category chip + expanded hint
    │       ├── ContextWarning.tsx      Long-context warning banner + dismiss button
    │       ├── TodaySummary.tsx        Today's totals + platform icon row
    │       ├── SettingsPanel.tsx       Inline settings (budget, notifications, sync)
    │       └── SignInPrompt.tsx        Shown when JWT absent + user clicks dashboard link
    │
    ├── onboarding/                     FIRST-INSTALL ONBOARDING
    │   ├── index.html
    │   ├── main.tsx
    │   └── components/
    │       ├── Onboarding.tsx          3-screen stepper component
    │       ├── Step1Welcome.tsx        "What AI Token Tracker does"
    │       ├── Step2Privacy.tsx        "Your data stays on your device"
    │       └── Step3Budget.tsx         Budget input field + skip button
    │
    └── utils/
        ├── storage.ts                  Typed wrappers for chrome.storage.local
        │                               getSession(), setSession(), getBudget(), setBudget()
        │                               getPrefs(), setPrefs(), getDayRollup(), etc.
        ├── constants.ts                DEFAULT_BUDGET, WARNING_THRESHOLDS (6k, 15k)
        │                               NOTIFICATION_THRESHOLDS (0.5, 0.8, 1.0)
        │                               SESSION_IDLE_TIMEOUT (30 min)
        │                               MAX_TURNS_PER_SESSION (500)
        ├── types.ts                    All TypeScript interfaces:
        │                               Session, Turn, Budget, DayRollup, Prefs,
        │                               CostConfig, SuggestionResult, PlatformConfig
        └── time.ts                     getWeekStart(), formatDuration(), isNewWeek()
```

---

## 6. Website — Deep Dive

### 6.1 Component Architecture

```
App (React Router provider)
├── PublicLayout (header with logo + nav, footer)
│   ├── LandingPage         /
│   ├── SignupPage          /signup
│   ├── LoginPage           /login
│   ├── VerifyOtpPage       /verify-otp
│   ├── PrivacyPolicyPage   /privacy-policy
│   ├── TermsPage           /terms
│   ├── CookiesPage         /cookies
│   └── NotFoundPage        /404
│
└── ProtectedLayout (sidebar nav, user menu, auth guard)
    ├── DashboardPage       /dashboard
    └── SettingsPage        /settings
```

### 6.2 Routing & Auth Guards

```tsx
// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Auth guard wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user)   return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/',              element: <PublicLayout><LandingPage /></PublicLayout> },
  { path: '/signup',        element: <PublicLayout><SignupPage /></PublicLayout> },
  { path: '/login',         element: <PublicLayout><LoginPage /></PublicLayout> },
  { path: '/verify-otp',    element: <PublicLayout><VerifyOtpPage /></PublicLayout> },
  { path: '/privacy-policy',element: <PublicLayout><PrivacyPolicyPage /></PublicLayout> },
  { path: '/terms',         element: <PublicLayout><TermsPage /></PublicLayout> },
  { path: '/cookies',       element: <PublicLayout><CookiesPage /></PublicLayout> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><ProtectedLayout><DashboardPage /></ProtectedLayout></ProtectedRoute>
  },
  {
    path: '/settings',
    element: <ProtectedRoute><ProtectedLayout><SettingsPage /></ProtectedLayout></ProtectedRoute>
  },
  { path: '*', element: <NotFoundPage /> }
]);
```

### 6.3 API Layer (Axios)

A single configured Axios instance is used across the entire website.
All API calls go through this instance, which handles auth headers,
base URL, and error responses centrally.

```ts
// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,  // https://api.yourwebsite.com
  withCredentials: true,    // send httpOnly JWT cookie on every request
  timeout:         10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT expired — redirect to login
      window.location.href = `/login?redirect=${window.location.pathname}`;
    }
    return Promise.reject(error);
  }
);

// src/api/auth.ts
export const authApi = {
  requestOtp:  (email: string)              => api.post('/auth/request-otp', { email }),
  verifyOtp:   (email: string, otp: string) => api.post('/auth/verify-otp',  { email, otp }),
  logout:      ()                           => api.post('/auth/logout'),
  me:          ()                           => api.get('/auth/me'),
};

// src/api/usage.ts
export const usageApi = {
  getUsage:    (range: '7d'|'30d'|'90d')   => api.get(`/api/usage?range=${range}`),
  getSettings: ()                           => api.get('/api/settings'),
  saveSettings:(data: Partial<Settings>)    => api.put('/api/settings', data),
  deleteData:  ()                           => api.delete('/api/data'),
};
```

### 6.4 State Management

No Redux or Zustand needed for this scale. Use React Context + hooks:

```
AuthContext         → { user, loading, login, logout }
                      wraps the entire app
                      calls GET /auth/me on mount to restore session from cookie

DashboardContext    → { usageData, loading, range, setRange, refetch }
                      scoped to /dashboard route only
                      fetches from GET /api/usage on mount and when range changes

SettingsContext     → { settings, saving, save }
                      scoped to /settings route only
                      fetches from GET /api/settings, POSTs changes via PUT /api/settings
```

### 6.5 Full Folder & File Structure

```
website/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env                              VITE_API_URL=https://api.yourwebsite.com
├── .env.local                        Local dev: VITE_API_URL=http://localhost:3000
├── index.html                        Vite HTML entry point
│
├── public/
│   ├── favicon.ico
│   └── og-image.png                  Open Graph image for social sharing
│
└── src/
    │
    ├── main.tsx                       React root: RouterProvider
    ├── router.tsx                     All routes + ProtectedRoute guard
    ├── App.tsx                        AuthContext provider wrapping RouterProvider
    │
    ├── api/
    │   ├── client.ts                  Axios instance + interceptors
    │   ├── auth.ts                    requestOtp, verifyOtp, logout, me
    │   └── usage.ts                   getUsage, getSettings, saveSettings, deleteData
    │
    ├── contexts/
    │   ├── AuthContext.tsx             user, loading, login(), logout()
    │   ├── DashboardContext.tsx        usageData, range, setRange, refetch
    │   └── SettingsContext.tsx         settings, saving, save()
    │
    ├── hooks/
    │   ├── useAuth.ts                  Consume AuthContext
    │   ├── useDashboard.ts             Consume DashboardContext
    │   └── useSettings.ts             Consume SettingsContext
    │
    ├── layouts/
    │   ├── PublicLayout.tsx            Header (logo + nav links) + footer
    │   └── ProtectedLayout.tsx         Sidebar nav + user menu + content area
    │
    ├── pages/
    │   ├── LandingPage.tsx             Sections: Hero, Features, Platforms, HowItWorks,
    │   │                               Screenshots, FAQ, CTA, Footer
    │   ├── SignupPage.tsx              Email input form → POST /auth/request-otp
    │   ├── LoginPage.tsx               Same as Signup (same UX, same endpoint)
    │   ├── VerifyOtpPage.tsx           6-digit OTP input → POST /auth/verify-otp
    │   ├── DashboardPage.tsx           Summary cards + charts + tables
    │   ├── SettingsPage.tsx            Budget, sync, model prefs, platform toggles, data delete
    │   ├── PrivacyPolicyPage.tsx       Static content (from PRD Section 14.2)
    │   ├── TermsPage.tsx               Static content (from PRD Section 14.3)
    │   ├── CookiesPage.tsx             Static content (from PRD Section 14.4)
    │   └── NotFoundPage.tsx            Custom 404
    │
    ├── components/
    │   │
    │   ├── landing/                    Landing page section components
    │   │   ├── Hero.tsx                Headline + CTA buttons (Chrome/Edge/Brave)
    │   │   ├── Features.tsx            6-card features grid
    │   │   ├── Platforms.tsx           20-platform name/badge grid
    │   │   ├── HowItWorks.tsx          3-step visual
    │   │   ├── Screenshots.tsx         Mockup images of popup + dashboard
    │   │   ├── FAQ.tsx                 Accordion with 6+ Q&As
    │   │   └── Footer.tsx              Links: Privacy · Terms · Cookies · GitHub · Email
    │   │
    │   ├── auth/
    │   │   ├── EmailForm.tsx           Reusable email input + submit button
    │   │   └── OtpInput.tsx            6 individual digit boxes with auto-advance
    │   │                               Handles paste, backspace, keyboard navigation
    │   │
    │   ├── dashboard/
    │   │   ├── SummaryCards.tsx        4 stat cards (tokens/cost/platform/model this week)
    │   │   ├── UsageChart.tsx          Recharts LineChart or BarChart, range toggle (7d/30d/90d)
    │   │   ├── PlatformDonut.tsx       Recharts PieChart showing platform share
    │   │   ├── ModelTable.tsx          Sortable table: model · platform · tokens · cost · sessions
    │   │   ├── SessionsTable.tsx       Last 20 sessions with all columns
    │   │   ├── BudgetWidget.tsx        Progress bar + current spend + edit button
    │   │   └── SyncBanner.tsx          Shown when sync is off
    │   │
    │   ├── settings/
    │   │   ├── BudgetSettings.tsx      Weekly cap input + notification toggles
    │   │   ├── SyncToggle.tsx          On/off toggle + explainer text
    │   │   ├── ModelPrefs.tsx          4 dropdowns (quickQA, code, longCtx, creative)
    │   │   ├── PlatformToggles.tsx     List of all 20 platforms with enable/disable
    │   │   └── DeleteDataModal.tsx     Confirmation modal for data deletion
    │   │
    │   └── ui/                         Shared UI primitives
    │       ├── Button.tsx              Primary, secondary, ghost, danger variants
    │       ├── Input.tsx               Text input with label + error message
    │       ├── Card.tsx                Container card with padding + shadow
    │       ├── Badge.tsx               Small colored pill (platform tiers etc.)
    │       ├── Spinner.tsx             Loading spinner
    │       ├── Skeleton.tsx            Loading skeleton for charts/tables
    │       ├── Modal.tsx               Accessible modal with backdrop
    │       ├── Toggle.tsx              Accessible on/off toggle switch
    │       └── Tooltip.tsx             Info tooltip on hover
    │
    └── types/
        ├── api.ts                      Response types matching backend DTOs
        └── domain.ts                   UsageEvent, Session, Settings, User etc.
```

---

## 7. Backend — Deep Dive

### 7.1 Layered Architecture

Every request passes through this exact chain:

```
HTTP Request
     │
     ▼
Cloudflare (DDoS / WAF / Rate limit L1)
     │
     ▼
Express App
     │
     ├── Global middleware (helmet, cors, body-parser, hpp, compression, morgan)
     ├── Global IP rate limiter (120 req/min per IP)
     │
     ▼
Router (routes/auth.ts or routes/api.ts)
     │
     ├── Route-specific rate limiters
     ├── Input validation middleware (zod schemas)
     ├── authenticateJWT middleware (protected routes only)
     │
     ▼
Controller (controllers/authController.ts or controllers/apiController.ts)
  → Calls one or more Services
     │
     ▼
Service (services/authService.ts, services/usageService.ts, etc.)
  → Contains business logic
  → Calls Prisma client for DB operations
     │
     ▼
Prisma Client → PostgreSQL (Supabase)
     │
     ▼
Controller formats response → res.json(...)
     │
     ▼
HTTP Response
     │
     ▼ (if error anywhere in chain)
Global Error Handler middleware
  → logs error server-side
  → returns sanitized error to client (never stack traces)
```

### 7.2 Middleware Pipeline

```ts
// src/app.ts — full middleware registration order

import express     from 'express';
import helmet      from 'helmet';
import cors        from 'cors';
import hpp         from 'hpp';
import compression from 'compression';
import morgan      from 'morgan';
import cron        from 'node-cron';

import { globalRateLimiter }    from './middleware/rateLimiters';
import { errorHandler }         from './middleware/errorHandler';
import { notFoundHandler }      from './middleware/notFoundHandler';
import authRouter               from './routes/auth';
import apiRouter                from './routes/api';
import healthRouter             from './routes/health';
import { startCleanupJob }      from './jobs/otpCleanup';

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:       [process.env.FRONTEND_URL!, `chrome-extension://${process.env.EXTENSION_ID}`],
  credentials:  true,
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders:['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(hpp());
app.use(compression());
app.use(morgan('combined'));

// ── Global rate limit ─────────────────────────────────────────────────
app.use(globalRateLimiter);   // 120 req/min per IP across all routes

// ── Routes ────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/auth',   authRouter);
app.use('/api',    apiRouter);    // all protected routes

// ── Error handling (must be last) ─────────────────────────────────────
app.use(notFoundHandler);   // 404 for unknown routes
app.use(errorHandler);      // global error formatter

// ── Background jobs ───────────────────────────────────────────────────
startCleanupJob();   // node-cron: delete expired OTPs every hour

export default app;
```

### 7.3 REST API Specification

---

#### `GET /health`

Health check endpoint. Used by Railway/Render for container health monitoring.

```
Response 200:
{ "status": "ok", "timestamp": "2026-07-26T10:00:00.000Z" }
```

---

#### `POST /auth/request-otp`

Request an OTP for the given email address.

```
Rate limits:  5 per IP per 10 min  +  3 per email per 10 min
Auth:         None

Request body:
{ "email": "user@example.com" }

Response 200:
{ "message": "Verification code sent to your email." }

Response 400:
{ "error": "Invalid email address." }

Response 429:
{ "error": "Too many requests. Try again in 8 minutes.", "retryAfter": 480 }
```

---

#### `POST /auth/verify-otp`

Verify an OTP and receive a JWT.

```
Rate limits:  10 per IP per 10 min
Auth:         None

Request body:
{ "email": "user@example.com", "otp": "483920" }

Response 200:
{
  "message": "Authenticated successfully.",
  "user": { "id": "uuid", "email": "user@example.com" }
}
Sets cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

Response 400:
{ "error": "Invalid or expired verification code." }

Response 401:
{ "error": "Incorrect verification code. 3 attempts remaining." }

Response 429:
{ "error": "Too many failed attempts. Request a new code." }
```

---

#### `POST /auth/logout`

Clear the JWT cookie and invalidate the session.

```
Auth: JWT cookie (optional — succeeds even if not logged in)

Response 200:
{ "message": "Logged out." }
Clears cookie: Set-Cookie: jwt=; HttpOnly; Max-Age=0
```

---

#### `GET /auth/me`

Return the currently authenticated user. Called by the website on app mount to restore session.

```
Auth: JWT cookie required

Response 200:
{ "id": "uuid", "email": "user@example.com" }

Response 401:
{ "error": "Authentication required." }
```

---

#### `GET /api/usage?range=7d`

Return aggregated usage data for the dashboard.

```
Auth:    JWT required
Params:  range = "7d" | "30d" | "90d" (default: "7d")
Limits:  30 per user per minute

Response 200:
{
  "summary": {
    "totalTokens":      142300,
    "totalCostUSD":     "2.41",
    "topPlatform":      "chatgpt",
    "topModel":         "gpt-4o"
  },
  "daily": [
    { "date": "2026-07-20", "tokens": 12400, "costUSD": "0.21" },
    ...
  ],
  "byPlatform": [
    { "platform": "chatgpt", "tokens": 89000, "costUSD": "1.52", "share": 0.63 },
    { "platform": "claude",  "tokens": 53300, "costUSD": "0.89", "share": 0.37 }
  ],
  "byModel": [
    { "model": "gpt-4o", "platform": "chatgpt", "tokens": 60000,
      "costUSD": "1.10", "sessions": 12 },
    ...
  ],
  "recentSessions": [
    { "sessionId": "uuid", "platform": "claude", "model": "claude-sonnet",
      "startTime": "2026-07-26T08:30:00Z", "durationMinutes": 22,
      "tokens": 4200, "costUSD": "0.063" },
    ...
  ]
}
```

---

#### `POST /api/sync`

Receive a batch of usage events from the extension.

```
Auth:    JWT required (Authorization: Bearer <token>)
Limits:  12 per user per hour

Request body:
{
  "events": [
    {
      "sessionId":        "uuid",
      "platform":         "chatgpt",
      "model":            "gpt-4o",
      "role":             "user",
      "estimatedTokens":  142,
      "estimatedCostUsd": 0.00071,
      "occurredAt":       "2026-07-26T10:32:00.000Z"
    },
    ...   // max 500 events per request
  ]
}

Response 200:
{ "synced": 47, "duplicatesSkipped": 3 }

Response 400:
{ "error": "Validation failed", "details": [...] }

Response 413:
{ "error": "Batch too large. Maximum 500 events per request." }
```

---

#### `GET /api/settings`

Return the current user's settings.

```
Auth: JWT required

Response 200:
{
  "weeklyLimitUsd":    "5.00",
  "syncEnabled":       true,
  "notify50":          true,
  "notify80":          true,
  "notify100":         true,
  "preferredQuick":    "gpt-4o-mini",
  "preferredCode":     "claude-sonnet",
  "preferredLong":     "gemini-1.5-pro",
  "preferredCreative": "claude-sonnet"
}
```

---

#### `PUT /api/settings`

Update one or more settings fields (partial update supported).

```
Auth:   JWT required
Limits: 10 per user per minute

Request body (all fields optional):
{
  "weeklyLimitUsd":    10.00,
  "syncEnabled":       true,
  "preferredCode":     "gpt-4o"
}

Response 200:
{ "message": "Settings updated.", "settings": { ...updated fields } }
```

---

#### `DELETE /api/data`

Delete all usage data for the current user. Settings and account are preserved.

```
Auth:   JWT required
Limits: 3 per user per hour

Response 200:
{ "message": "All usage data deleted.", "eventsDeleted": 1842 }
```

---

### 7.4 Full Folder & File Structure

```
backend/
│
├── package.json
├── tsconfig.json
├── .env                              Secrets (never committed)
├── .env.example                      Template with placeholder values (committed)
├── .gitignore
├── Procfile                          For Railway: "web: node dist/server.js"
│
├── prisma/
│   ├── schema.prisma                 Prisma data model (see Section 9)
│   └── migrations/                   Auto-generated migration files
│       └── 0001_initial/
│
└── src/
    │
    ├── server.ts                      Entry point: creates HTTP server, calls app.listen()
    │                                  Graceful shutdown on SIGTERM
    ├── app.ts                         Express app factory: registers all middleware + routes
    │
    ├── config/
    │   ├── env.ts                     Validates all required env vars on startup (throws if missing)
    │   │                              Exports typed config object used throughout the app
    │   └── prisma.ts                  Singleton Prisma client instance
    │
    ├── routes/
    │   ├── health.ts                  GET /health
    │   ├── auth.ts                    POST /auth/request-otp, /verify-otp, /logout · GET /auth/me
    │   └── api.ts                     All /api/* routes (all protected by authenticateJWT)
    │
    ├── middleware/
    │   ├── rateLimiters.ts            All rate limiter instances:
    │   │                              globalRateLimiter, otpIpLimiter, otpEmailLimiter,
    │   │                              userApiLimiter, syncLimiter, settingsLimiter, dataDeleteLimiter
    │   ├── authenticateJWT.ts         Verifies JWT (cookie or Authorization header)
    │   │                              Sets req.user = { id, email }
    │   ├── validate.ts                Zod validation middleware factory:
    │   │                              validate(schema) → Express middleware
    │   ├── errorHandler.ts            Global error handler: logs + returns sanitized response
    │   └── notFoundHandler.ts         404 handler for unknown routes
    │
    ├── controllers/
    │   ├── authController.ts          requestOtp(), verifyOtp(), logout(), me()
    │   │                              Thin layer: validates, calls service, formats response
    │   └── apiController.ts           getUsage(), sync(), getSettings(), updateSettings(), deleteData()
    │
    ├── services/
    │   ├── authService.ts             generateOtp(), hashOtp(), saveOtpRecord(),
    │   │                              verifyOtpRecord(), issueJWT(), upsertUser()
    │   ├── emailService.ts            sendOtpEmail(email, otp) via Nodemailer
    │   │                              Templates OTP email, handles transporter errors
    │   ├── usageService.ts            getUsageForUser(userId, range)
    │   │                              aggregateDailyData(), aggregateByPlatform(), aggregateByModel()
    │   │                              getRecentSessions()
    │   ├── syncService.ts             batchUpsertEvents(userId, events)
    │   │                              Returns { synced, duplicatesSkipped }
    │   └── settingsService.ts         getUserSettings(), updateUserSettings(), deleteUserData()
    │
    ├── schemas/                       Zod validation schemas (shared by middleware)
    │   ├── auth.schemas.ts            requestOtpSchema, verifyOtpSchema
    │   └── api.schemas.ts             syncSchema, updateSettingsSchema
    │
    ├── jobs/
    │   └── otpCleanup.ts              node-cron job: runs every hour
    │                                  DELETE FROM otp_records WHERE used=true OR expiresAt < NOW()
    │
    └── types/
        └── express.d.ts               Extends Express Request:
                                       req.user: { id: string; email: string }
```

---

## 8. Cross-Component Communication

### 8.1 Extension ↔ Website (Auth Handoff)

```
Extension Popup                Website (new tab)              Backend
──────────────                 ─────────────────              ───────

[Sign In clicked]
      │
      ├─ chrome.tabs.create({
      │    url: 'https://yourwebsite.com/login
      │          ?source=extension
      │          &extId=<EXTENSION_ID>'
      │  })
      │
      │                  [User fills email, gets OTP, enters OTP]
      │                          │
      │                          ├─────────────────────────────► POST /auth/verify-otp
      │                          │                               ◄─── 200 { token } + cookie
      │                          │
      │                          ├─ if source=extension in URL params:
      │                          │    chrome.runtime.sendMessage(extId, {
      │                          │      type: 'AUTH_SUCCESS',
      │                          │      token: jwt
      │                          │    })
      │◄─────────────────────────┘
      │
[onMessage: AUTH_SUCCESS]
      │
      ├─ chrome.storage.local.set({ jwt: token })
      ├─ chrome.tabs.remove(loginTabId)
      └─ Re-render popup with logged-in state
```

### 8.2 Extension ↔ Backend (Usage Sync)

```
Extension Background Worker                    Backend
───────────────────────────                    ───────

chrome.alarms fires ('sync')
      │
      ├─ Read prefs.syncEnabled → false? return
      ├─ Read jwt from storage → null? queue + return
      ├─ Collect events since prefs.lastSyncAt:
      │    events = [...prefs.pendingSyncEvents, ...newTurnsSinceLastSync]
      ├─ If events.length === 0 → return
      │
      ├──────────────────────────────────────────► POST /api/sync
      │                                             Authorization: Bearer <jwt>
      │                                             Body: { events }
      │◄────────────────────────────────────────── 200 { synced: N }
      │
      ├─ prefs.lastSyncAt = Date.now()
      ├─ prefs.pendingSyncEvents = []
      └─ chrome.storage.local.set({ prefs })
```

### 8.3 Website ↔ Backend (Dashboard Data)

```
Website DashboardPage                          Backend
─────────────────────                          ───────

DashboardContext mounts
      │
      ├──────────────────────────────────────► GET /api/usage?range=7d
      │                                        Cookie: jwt=<token>
      │◄───────────────────────────────────── 200 { summary, daily, byPlatform, ... }
      │
      ├─ setUsageData(response.data)
      ├─ Recharts renders charts from usageData
      │
      │  [User changes range to 30d]
      │
      ├──────────────────────────────────────► GET /api/usage?range=30d
      │◄───────────────────────────────────── 200 { ... }
      └─ Charts re-render with new data
```

### 8.4 Settings Sync (Website → Extension)

Settings changed on the website need to reach the extension.
Since the website cannot directly message the extension (no persistent connection),
the extension polls for settings on every popup open if sync is enabled:

```
User opens extension popup
      │
      ├─ If prefs.syncEnabled && jwt present:
      │    GET /api/settings → update prefs in chrome.storage.local
      │    (this refreshes preferredModels, budget, platform toggles)
      │
      └─ Render popup from (now-updated) storage
```

---

## 9. Database Design

### Entity Relationship

```
users
  │
  ├── 1:many ──► usage_events
  │               (all token tracking data synced from extension)
  │
  └── 1:1 ─────► user_settings
                  (budget, preferred models, sync preferences)

otp_records   (standalone — not linked to users until verification succeeds)
```

### Index Strategy

```sql
-- Fast user lookups in every API call
users:         UNIQUE INDEX on email

-- OTP lookup: always filtered by email + used + expiresAt
otp_records:   INDEX on (email)
               Rows deleted within 1 hour of expiry by cleanup job
               No long-term accumulation

-- Usage queries: always filtered by userId + time range
usage_events:  INDEX on (user_id, occurred_at DESC)
               UNIQUE on (user_id, session_id, occurred_at) — dedup on sync

-- user_settings: primary key IS the user_id (1:1 relationship)
user_settings: PRIMARY KEY on user_id — O(1) lookup
```

### Data Volume Estimates (per active user, per month)

```
Assumptions: 50 AI messages/day, 30 days/month = 1,500 events/month

usage_events row size: ~200 bytes
1,500 events × 200 bytes = 300KB/month per user

For 100 active users with sync enabled:
  30MB/month in usage_events
  Well within Supabase free tier (500MB total)

Supabase free tier limits:
  Storage: 500MB
  Database size: 500MB
  Bandwidth: 5GB/month
  → Comfortable for a college project at any realistic user count
```

---

## 10. Tech Stack Reference

### Browser Extension

| Layer | Library / Tool | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety across all extension code |
| UI framework | React | 18.x | Popup and onboarding UI |
| Build tool | Vite | 5.x | Fast dev server + production bundler |
| Extension plugin | vite-plugin-web-extension | latest | Handles manifest, IIFE content scripts |
| Cross-browser | webextension-polyfill | 0.10.x | Normalizes browser API differences |
| Tokenizer | js-tiktoken | latest | Token estimation (cl100k_base encoding) |
| Styling | Tailwind CSS (CDN) | 3.x | Popup UI styles |

### Website

| Layer | Library / Tool | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety |
| UI framework | React | 18.x | Component-based UI |
| Build tool | Vite | 5.x | Fast builds |
| Routing | React Router | 6.x | Client-side routing + protected routes |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| HTTP client | Axios | 1.x | API calls with interceptors |
| Charts | Recharts | 2.x | Usage analytics charts |
| Deployment | Vercel | — | Free tier, auto-deploy from GitHub |
| CDN / security | Cloudflare | — | DDoS, WAF, CDN, SSL (free tier) |

### Backend

| Layer | Library / Tool | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety |
| Runtime | Node.js | 20 LTS | Server runtime |
| Framework | Express | 4.x | HTTP server + routing |
| ORM | Prisma | 5.x | Type-safe DB queries |
| Database | PostgreSQL | 15 | Relational database |
| DB hosting | Supabase | — | Free tier managed Postgres |
| Validation | Zod | 3.x | Request body validation schemas |
| Auth tokens | jsonwebtoken | 9.x | JWT sign + verify |
| OTP hashing | bcrypt | 5.x | Hash OTPs before storing |
| Email | Nodemailer | 6.x | Gmail SMTP OTP delivery |
| Security headers | Helmet | 7.x | CSP, HSTS, X-Frame-Options etc. |
| Rate limiting | express-rate-limit | 7.x | Per-IP and per-user limits |
| Rate limit store | rate-limit-redis | 4.x | Shared Redis store for limits |
| Redis | Upstash Redis | — | Free tier Redis (rate limiter store) |
| Compression | compression | 1.x | Gzip responses |
| Logging | Morgan | 1.x | HTTP request logs |
| Scheduler | node-cron | 3.x | OTP cleanup job (runs hourly) |
| Deployment | Railway | — | Free tier managed Node.js hosting |

---

## 11. Build & Deployment Pipeline

### Extension Build & Release

```
Local development:
  npm run dev          → Vite watch mode
                         Output to dist/
                         Load as unpacked extension in Chrome (chrome://extensions)
                         Changes to popup/background hot-reload via Vite HMR
                         Changes to content scripts require manual extension reload

Production build:
  npm run build        → TypeScript compile + Vite production build
                         Tree-shaking, minification, correct IIFE for content scripts
  npm run zip          → Runs build, then: cd dist && zip -r ../ai-token-tracker-v1.0.0.zip .
                         Upload zip to Chrome Web Store developer dashboard
                         Upload same zip to Edge Add-ons (same build works)

Chrome Web Store review:
  → Submit zip + store listing + screenshots
  → Fill in Privacy Practices (permissions justification, data disclosure)
  → Review takes 1–3 business days
  → Once approved, published to Chrome Web Store URL
  → Same URL used in website CTA button
```

### Website Deployment (Vercel)

```
GitHub repo: monorepo or separate repo for website

Vercel setup:
  1. Connect GitHub repo to Vercel
  2. Set root directory to /website (if monorepo)
  3. Set build command: npm run build
  4. Set output directory: dist
  5. Set environment variables:
       VITE_API_URL = https://api.yourwebsite.com

Auto-deploy:
  → Every push to main branch → Vercel triggers a new build and deploys
  → Preview deployments created for every PR (useful for testing before merge)

Custom domain:
  → Add yourwebsite.com in Vercel dashboard
  → Point Cloudflare DNS to Vercel:
      A record: @ → 76.76.21.21 (Vercel IP)
      CNAME: www → cname.vercel-dns.com
  → Enable Cloudflare proxy (orange cloud) for DDoS + CDN
  → Set SSL/TLS mode in Cloudflare to "Full (strict)"
```

### Backend Deployment (Railway)

```
GitHub repo: same monorepo or separate repo for backend

Railway setup:
  1. Create new Railway project → Deploy from GitHub repo
  2. Set root directory to /backend (if monorepo)
  3. Set build command: npm run build  (tsc → dist/)
  4. Set start command: node dist/server.js
  5. Set all environment variables in Railway dashboard (see Section 12)
  6. Provision PostgreSQL: add Railway Postgres plugin OR use Supabase URL
  7. Provision Redis: add Upstash Redis plugin OR use Upstash URL

Custom domain:
  → Add api.yourwebsite.com in Railway dashboard
  → Add CNAME record in Cloudflare:
      CNAME: api → <railway-generated-domain>.railway.app
  → Enable Cloudflare proxy for DDoS protection

Health checks:
  → Railway uses GET /health to determine if container is healthy
  → If /health returns non-200, Railway restarts the container
```

### CI/CD (GitHub Actions — Optional but Recommended)

```yaml
# .github/workflows/backend.yml
name: Backend CI

on:
  push:
    branches: [main]
    paths:    ['backend/**']

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: backend
      - run: npm run build
        working-directory: backend
      - run: npm test          # Jest unit tests for services + suggestion engine
        working-directory: backend
```

---

## 12. Environment Variables

### Extension (`extension/.env`)

```bash
VITE_API_URL=http://localhost:3000         # Backend URL (local dev)
VITE_EXTENSION_ID=your-extension-id       # Used in externally_connectable
VITE_COST_CONFIG_URL=https://raw.githubusercontent.com/youruser/ai-token-tracker/main/config/costs.json
```

### Website (`website/.env`)

```bash
VITE_API_URL=https://api.yourwebsite.com  # Backend URL
```

### Backend (`backend/.env`)

```bash
# App
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Auth
JWT_SECRET=<output of: openssl rand -hex 32>
# Example: a3f9c8e21b47d56f90a12c3e8f4b7d91c2a6e3f5b8d0c9e7f2a4b6d8e1f3a5c

# Email
GMAIL_USER=yourapp@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
# Generate App Password: Google Account → Security → 2FA enabled → App Passwords

# CORS
FRONTEND_URL=https://yourwebsite.com
EXTENSION_ID=abcdefghijklmnopqrstuvwxyz123456

# Redis (rate limiting)
REDIS_URL=redis://default:token@region.upstash.io:6379
```

**Never commit `.env` to GitHub.** Add to `.gitignore`.
Commit `.env.example` with placeholder values and document it in `README.md`.

---

## 13. Local Development Setup

### Prerequisites

```
Node.js 20 LTS      (https://nodejs.org)
npm 10+             (comes with Node 20)
Git
PostgreSQL          (local) OR Supabase free account
Redis               (local via Docker) OR Upstash free account
Gmail account       with 2FA + App Password set up
Chrome browser      for extension development
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/youruser/ai-token-tracker.git
cd ai-token-tracker
```

### Step 2: Start the Backend

```bash
cd backend
npm install

# Copy env template and fill in your values
cp .env.example .env
# Edit .env: fill in DATABASE_URL, JWT_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD, REDIS_URL

# Run Prisma migrations
npx prisma migrate dev --name initial

# Start dev server (ts-node with watch)
npm run dev
# Server starts at http://localhost:3000
# Test: GET http://localhost:3000/health → { "status": "ok" }
```

### Step 3: Start the Website

```bash
cd website
npm install
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:3000

npm run dev
# Website at http://localhost:5173
```

### Step 4: Load the Extension

```bash
cd extension
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000

npm run dev
# Builds to extension/dist/ in watch mode
```

In Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `extension/dist/` folder
5. Extension icon appears in toolbar
6. Go to `claude.ai`, `chatgpt.com` etc. and start a conversation

Changes to popup/background: auto-reload via Vite HMR (may need to click "reload" on the extensions page for background worker changes).
Changes to content scripts: click the reload icon on the extension card in `chrome://extensions`.

### Step 5: Verify Everything Works

```bash
# Test OTP flow end-to-end:
# 1. Open extension popup → click "Sign In"
# 2. New tab opens to localhost:5173/login
# 3. Enter your email → check Gmail for OTP
# 4. Enter OTP → verify → popup should show logged-in state

# Test token tracking:
# 1. Open claude.ai or chatgpt.com
# 2. Send a message
# 3. Click extension icon → should show ~N tokens in session panel

# Test sync:
# 1. Make sure sync is enabled in popup settings
# 2. Wait up to 10 minutes (or trigger manually in background worker)
# 3. Open localhost:5173/dashboard → data should appear
```

### Project Repository Structure (Monorepo)

```
ai-token-tracker/                      GitHub repo root
│
├── README.md                          Setup guide, architecture summary, contributing
├── LICENSE                            MIT License
├── .github/
│   ├── workflows/
│   │   ├── backend.yml                CI: build + test backend on push
│   │   └── website.yml                CI: build website on push
│   └── ISSUE_TEMPLATE/                Bug report + feature request templates
│
├── extension/                         Browser extension (see Section 5.7)
├── website/                           React website (see Section 6.5)
├── backend/                           Express API (see Section 7.4)
└── config/
    └── costs.json                     Remote token cost table (fetched by extension)
                                       Updated manually when model pricing changes
```

---

*End of Document — AI Token Tracker Architecture v1.0*  
*Companion: prd.md v1.1*