# Product Requirements Document
## AI Token Tracker — Browser Extension & Web Platform

**Version:** 1.1  
**Status:** Revised  
**Last Updated:** July 2026  
**Author:** [Your Name]  
**Project Type:** College Final Year Project  
**Repository:** GitHub (Public, MIT License)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users](#4-target-users)
5. [Scope](#5-scope)
6. [System Architecture Overview](#6-system-architecture-overview)
7. [Platform Support](#7-platform-support)
8. [Feature Requirements](#8-feature-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Security & Rate Limiting](#10-security--rate-limiting)
11. [Technical Stack](#11-technical-stack)
12. [Data Models](#12-data-models)
13. [User Flows](#13-user-flows)
14. [Website Pages & Content](#14-website-pages--content)
15. [Extension Structure](#15-extension-structure)
16. [Out of Scope](#16-out-of-scope)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Milestones & Build Order](#18-milestones--build-order)
19. [Resolved Decisions](#19-resolved-decisions)

---

## 1. Project Overview

**AI Token Tracker** is a browser extension paired with a companion website that helps users understand, monitor, and optimize their usage of AI chat platforms. It runs silently in the background across 15–20 major AI chat interfaces, estimates token consumption and approximate cost per conversation, enforces user-defined spending budgets, and intelligently suggests the most cost-efficient AI model for the task at hand based on real-time chat content.

The companion website serves as the primary landing and download portal, handles user authentication (email OTP via Gmail SMTP), and hosts a full-featured web dashboard where users can view historical usage analytics synced from the extension. The project is open source under the MIT License and hosted publicly on GitHub.

---

## 2. Problem Statement

AI chat tools have become central to how students, developers, and knowledge workers operate. However:

- **No visibility into consumption:** Web chat interfaces for ChatGPT, Claude, Gemini, and others do not surface token counts or cost estimates to end users. Token counting is an API-only feature.
- **Unintended cost accumulation:** Users who access AI through personal API keys or subscription tiers have no reliable way to track how quickly they are exhausting limits or spending money across different tools simultaneously.
- **Inefficient model selection:** Most users default to the most capable (and expensive) model for every task, including trivial ones, wasting tokens and money.
- **Context-length blindness:** As conversations grow, the cost of each new message increases because the entire history is resent. Users are not warned when this becomes expensive.
- **Fragmented tooling:** There is no single tool that works across multiple AI platforms in a unified interface.

---

## 3. Goals & Success Metrics

### Primary Goals

- Give users real-time visibility into token usage and estimated cost across all major AI chat platforms.
- Enforce user-defined weekly budgets with proactive notifications.
- Recommend the right model for the current task, reducing unnecessary spending.
- Provide a clean, data-rich web dashboard with historical analytics.
- Run reliably at public scale with proper rate limiting and security hardening.

### Success Metrics

| Metric | Target |
|---|---|
| Platforms supported | ≥ 15 major AI chat interfaces |
| Token estimation accuracy | Within ±10% of actual count |
| Browser compatibility | Chrome, Edge, Brave (Chromium-based) |
| Extension popup load time | < 200ms |
| OTP delivery time | < 30 seconds |
| Web dashboard chart render | < 1 second |
| Budget notification latency | < 5 seconds after threshold crossed |
| Auth endpoint uptime | 99.5% |
| Rate limit false-positive rate | < 0.1% of legitimate requests blocked |

---

## 4. Target Users

### Primary: Students & Researchers
- Use multiple AI tools daily for studying, writing, and coding.
- On free or student subscription tiers with usage caps.
- Want to understand which tool is the best value for each task type.
- Not necessarily technically sophisticated — the UI must be intuitive.

### Secondary: Freelancers & Independent Developers
- Use API keys for AI integrations and want to track spend per project or client.
- Use web chat for exploratory tasks and want consolidated usage visibility.
- May want to export usage reports.

### Tertiary: Power Users & AI Enthusiasts
- Run multiple AI models in parallel to compare outputs.
- Want granular per-session and per-model statistics.
- Interested in the model suggestion engine and cost-vs-quality hints.

### Out-of-scope users
- Enterprise teams needing multi-user shared dashboards (future version).
- Users accessing AI exclusively through native mobile apps.

---

## 5. Scope

### In Scope (v1.0)

- Browser extension (Chrome, Edge, Brave — Chromium / Manifest V3 unified build).
- Token estimation via DOM scraping and local tokenizer approximation.
- Per-session and aggregated usage tracking stored in `chrome.storage.local`.
- Budget cap with percentage-based browser notifications.
- Rule-based model suggestion engine with task-type classification.
- Context-length warnings with summarization nudges.
- Email OTP authentication via Gmail SMTP (App Password).
- Companion website: landing page, auth, web dashboard, privacy policy, terms.
- Optional cloud sync of usage data to backend.
- Rate limiting, security headers, and input validation on all public endpoints.
- Open source release on GitHub under MIT License.

### Phase 2 (Post-submission, future)

- Exact tokenization via user-provided API keys.
- Cost comparison side-panel across models.
- Usage export (CSV / PDF).
- Firefox support.
- Team/organization dashboard.

---

## 6. System Architecture Overview

```
+----------------------------------------------------------+
|               AI Platform Sites (15-20)                  |
|   ChatGPT · Claude · Gemini · Perplexity · Copilot...   |
+---------------------------+------------------------------+
                            |  content scripts injected
                            v
+-------------------------------+   +------------------------------+
|     Browser Extension         |   |     Website (Vercel)         |
|  (Chrome / Edge / Brave)      |   |  Landing · Auth · Dashboard  |
|  +-------------------------+  |   |  React + Vite + Tailwind CSS |
|  | Content Scripts         |  |   +----------------+-------------+
|  | (config-driven scraper) |  |                    |
|  +----------+--------------+  |     shared JWT (httpOnly cookie
|             v                 |     + chrome.storage.local)
|  +-------------------------+  |                    |
|  | Background Service      |  |                    v
|  | Worker                  |  |   +------------------------------+
|  | · tokenize text         |  |   |   Backend (Railway/Render)   |
|  | · update budgets        +<-+-->+   Node.js + Express          |
|  | · fire notifications    |  |   |   Helmet · Rate Limiter      |
|  | · suggest models        |  |   |   Auth · Sync API            |
|  +----------+--------------+  |   |   Gmail SMTP (Nodemailer)    |
|             v                 |   |   PostgreSQL (Supabase)      |
|  +-------------------------+  |   +-----+------------------------+
|  | chrome.storage.local    |  |         |
|  +----------+--------------+  |   +-----v------------------------+
|             v                 |   |   Cloudflare (free tier)     |
|  +-------------------------+  |   |   DDoS protection · CDN      |
|  | Popup UI (React)        |  |   |   WAF · SSL termination      |
|  +-------------------------+  |   +------------------------------+
+-------------------------------+

Remote cost config (GitHub-hosted JSON, fetched daily):
  extension → GET github.com/.../cost-config.json → cached in storage
```

---

## 7. Platform Support

Support is delivered via per-platform content script configuration objects.
One generic scraper reads these configs — no duplicate code per platform.

### Tier 1 — Core (shipped in MVP)

| # | Platform | URL | Model Family |
|---|---|---|---|
| 1 | ChatGPT | chatgpt.com | GPT-4o, GPT-4o-mini, o1, o3 |
| 2 | Claude | claude.ai | Claude 3.x / 4.x Opus, Sonnet, Haiku |
| 3 | Gemini | gemini.google.com | Gemini 1.5 / 2.x Pro, Flash |
| 4 | Perplexity | perplexity.ai | Mixed (GPT, Claude, Sonar) |
| 5 | Microsoft Copilot | copilot.microsoft.com | GPT-4o (Microsoft-hosted) |
| 6 | Meta AI | meta.ai | Llama 3.x |

### Tier 2 — Extended Support

| # | Platform | URL | Model Family |
|---|---|---|---|
| 7 | Grok | grok.com | Grok 2, Grok 3 |
| 8 | DeepSeek Chat | chat.deepseek.com | DeepSeek V2/V3 |
| 9 | Le Chat (Mistral) | chat.mistral.ai | Mistral Large, Nemo, Codestral |
| 10 | HuggingChat | huggingface.co/chat | Llama, Mistral, Qwen (open models) |
| 11 | Poe | poe.com | Multi-model aggregator |
| 12 | Qwen Chat | chat.qwen.ai | Qwen 2.x |

### Tier 3 — Best-effort

| # | Platform | URL | Model Family |
|---|---|---|---|
| 13 | Groq Chat | groq.com | Llama, Mixtral (fast inference) |
| 14 | You.com | you.com | Smart mode (mixed) |
| 15 | Kimi | kimi.moonshot.cn | Moonshot (long context) |
| 16 | Pi | pi.ai | Inflection Pi |
| 17 | OpenRouter Chat | openrouter.ai/chat | 100+ models |
| 18 | Cohere Coral | coral.cohere.com | Command R+ |
| 19 | Character.AI | character.ai | Custom fine-tuned |
| 20 | Copilot in Bing | bing.com/chat | GPT-4o (Bing-hosted) |

### Config-driven platform registration

```js
// src/content/platforms/config.js
export const platforms = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    matchUrls: ["*://chatgpt.com/*", "*://chat.openai.com/*"],
    selectors: {
      messageContainer: "div[data-testid='conversation-turn']",
      userMessage:      "[data-message-author-role='user']",
      assistantMessage: "[data-message-author-role='assistant']",
      modelLabel:       "button[data-testid='model-switcher-dropdown-button']"
    },
    tokenizerEncoding: "cl100k_base"
  },
  // ... one entry per platform
];
```

### Token cost config (remote JSON, updated manually)

Hosted as a raw JSON file in the GitHub repo at `/config/costs.json`.
The extension fetches this file once daily on startup and caches it in
`chrome.storage.local`. If the fetch fails, the cached version is used.
If no cache exists, the bundled fallback `defaultCosts.js` is used.

```json
{
  "lastUpdated": "2026-07-26",
  "models": {
    "gpt-4o":          { "inputPer1k": 0.005,  "outputPer1k": 0.015 },
    "gpt-4o-mini":     { "inputPer1k": 0.00015,"outputPer1k": 0.0006 },
    "claude-opus-4":   { "inputPer1k": 0.015,  "outputPer1k": 0.075 },
    "claude-sonnet-4": { "inputPer1k": 0.003,  "outputPer1k": 0.015 },
    "claude-haiku-4":  { "inputPer1k": 0.00025,"outputPer1k": 0.00125 },
    "gemini-2-pro":    { "inputPer1k": 0.00125,"outputPer1k": 0.005 },
    "gemini-2-flash":  { "inputPer1k": 0.000075,"outputPer1k": 0.0003 },
    "default":         { "inputPer1k": 0.002,  "outputPer1k": 0.006 }
  }
}
```

---

## 8. Feature Requirements

### 8.1 Authentication

- `AUTH-01` — User enters email in the extension popup or on the website to request an OTP.
- `AUTH-02` — A 6-digit OTP is generated server-side, hashed with bcrypt (cost 10), and stored with a 5-minute expiry and max 5 verification attempts.
- `AUTH-03` — OTP is sent via Nodemailer using Gmail SMTP with an App Password (not raw Gmail password). The Gmail account used for sending must have 2FA enabled and an App Password generated under Google Account → Security → App Passwords.
- `AUTH-04` — On successful verification, backend issues a signed JWT (HS256, 7-day expiry). JWT is stored in `chrome.storage.local` (extension) and as an `httpOnly; SameSite=Strict` cookie (website).
- `AUTH-05` — OTP requests rate-limited to 3 per email per 10 minutes and 5 per IP per 10 minutes (separate counters). Exceeding either limit returns HTTP 429 with a `Retry-After` header.
- `AUTH-06` — OTP is invalidated immediately after one successful use. The `used` flag is set to `true` in the database row.
- `AUTH-07` — Extension login flow: popup opens the website's `/login` page in a new tab → user completes OTP on the website → website sends the JWT back to the extension via `chrome.runtime.sendMessage` using the extension ID → extension stores JWT and closes the tab.
- `AUTH-08` — Logout clears JWT from `chrome.storage.local` and invalidates the cookie via `Set-Cookie: jwt=; Max-Age=0`.
- `AUTH-09` — Extension operates fully in offline/logged-out mode. Auth is only required for cloud sync.

**Gmail SMTP configuration (Nodemailer):**

```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        // e.g. yourapp@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // 16-char App Password from Google
  }
});
```

**Gmail SMTP limits:** 500 emails per day on a free Gmail account. For a college project this is sufficient. If daily OTP volume ever approaches this, switch to SendGrid's free tier (100 emails/day, more reliable deliverability) by swapping the transporter config — no other code changes needed.

**OTP email template:**

```
From:    AI Token Tracker <yourapp@gmail.com>
Subject: Your verification code — [XXXXXX]

Hi,

Your one-time sign-in code is:

  [XXXXXX]

This code expires in 5 minutes and can only be used once.
Do not share this code with anyone.

If you did not request this, you can safely ignore this email.
No action is required.

— The AI Token Tracker Team
https://yourwebsite.com
```

---

### 8.2 Token & Cost Tracking

- `TRACK-01` — A MutationObserver is attached to the chat message container on page load, firing on each new user or assistant message node.
- `TRACK-02` — On each new message, extract text content and send `{ platform, model, role, text, timestamp }` to the background service worker via `chrome.runtime.sendMessage`.
- `TRACK-03` — Background worker tokenizes text using `js-tiktoken` with `cl100k_base` encoding as a universal approximation. All counts labeled "~" (estimated) in the UI.
- `TRACK-04` — Estimated token count and cost are written to the session record in `chrome.storage.local`. Raw message text is discarded immediately after tokenization and is never persisted or sent to the backend.
- `TRACK-05` — A session is: a continuous conversation on a single platform tab, starting on the first detected message, ending when the tab is closed or idle > 30 minutes.
- `TRACK-06` — Daily and weekly rollup totals maintained as separate storage keys, updated on every message (not recomputed from raw sessions).
- `TRACK-07` — Active model name is extracted from each platform's model selector element (per config). Falls back to "Unknown / [platform name]" if undetectable.
- `TRACK-08` — Cost per 1k tokens is read from the cached remote config. If a model is not in the config, the `"default"` rate is used.
- `TRACK-09` — On aggregator platforms (Poe, OpenRouter, HuggingChat), attempt to detect the underlying model from the UI. Fall back to aggregator name if not detectable.

---

### 8.3 Extension Popup

- `POPUP-01` — Renders in < 200ms from `chrome.storage.local` only (zero network calls on open).
- `POPUP-02` — Header: extension name + active platform icon + detected model name.
- `POPUP-03` — Live session panel: tokens this session, estimated cost, session duration, platform.
- `POPUP-04` — Budget progress bar: `currentWeekUSD / weeklyLimitUSD`, color-coded green → amber (60%) → red (80%).
- `POPUP-05` — Model suggestion chip: colored pill with detected task type + recommended model tier. Clicking expands explanation.
- `POPUP-06` — Context-length warning banner when session tokens > 6,000.
- `POPUP-07` — Today's summary: tokens today, cost today, platforms used (icon row).
- `POPUP-08` — "View full dashboard" link → opens web dashboard in a new tab.
- `POPUP-09` — Cog icon → inline settings panel (budget cap, notifications, sync toggle).
- `POPUP-10` — "Sign in" prompt shown when JWT is absent and user attempts to open the dashboard.

---

### 8.4 Budget Management & Notifications

- `BUDGET-01` — Users set a weekly budget as USD or token count (stored as USD internally).
- `BUDGET-02` — Storage key: `budget: { weeklyLimitUSD, currentWeekUSD, weekStartDate, notified50, notified80, notified100, notificationsEnabled }`.
- `BUDGET-03` — `chrome.alarms` fires every 5 minutes to check thresholds.
- `BUDGET-04` — Notifications fire at 50%, 80%, and 100% of weekly budget. Each fires only once per budget period.
- `BUDGET-05` — At 100%: "You've hit your weekly AI budget. Tracking continues — this is a heads-up, not a block."
- `BUDGET-06` — Budget resets every Monday 00:00 local time. `currentWeekUSD` zeroed, all `notifiedXX` flags cleared.
- `BUDGET-07` — Budget can be edited from the popup settings panel and the web dashboard settings page.
- `BUDGET-08` — `notificationsEnabled: false` suppresses all threshold alerts globally.

---

### 8.5 Model Suggestion Engine

- `SUGGEST-01` — Runs in background worker after each new user message.
- `SUGGEST-02` — Task classification scoring:

| Category | Signals | Suggested Tier |
|---|---|---|
| Quick Q&A | Prompt < 100 tokens, ends with `?`, factual keywords | Cheap / fast |
| Code | Backticks, keywords: function, class, bug, error, debug, syntax, compile | Strong reasoning |
| Long-context | Prompt > 500 tokens, keywords: summarize, document, file, entire, paste | High context-window |
| Creative | Keywords: write a, story, poem, essay, script, draft, compose | Balanced mid-tier |
| Research | Keywords: explain, compare, pros and cons, analyse, difference between | Strong reasoning |

- `SUGGEST-03` — Highest scoring category wins. Ties default to Quick Q&A.
- `SUGGEST-04` — If budget remaining < 20%, always suggest cheapest tier with note: "Budget running low — a lighter model saves cost."
- `SUGGEST-05` — Suggestion chip text: `[Task: Code] → Claude Sonnet recommended`. Specific model name from user's "preferred model per tier" setting.
- `SUGGEST-06` — Cost-vs-quality hint for Quick Q&A: "This looks like a simple question — a faster model would likely give a similar answer for ~10× less cost."
- `SUGGEST-07` — User can dismiss the suggestion for the current session.
- `SUGGEST-08` — Classification is a single pure function for testability: `classifyTask(promptText, sessionTokens, budgetRemainingUSD) → { category, tier, hint }`.

---

### 8.6 Context-Length Warning

- `CTX-01` — Background worker tracks cumulative session tokens per tab.
- `CTX-02` — Warning flag set when session tokens exceed 6,000.
- `CTX-03` — Popup banner shown when flag is set.
- `CTX-04` — Banner has two actions: "How to summarize" (expands a 2-sentence tip) and "Dismiss for this session".
- `CTX-05` — Second warning at 15,000 tokens: "This chat sends a very large amount of context with every message. Starting fresh could reduce cost significantly."
- `CTX-06` — Warnings are per-tab-session. Switching tabs resets the active session counter.

---

### 8.7 Web Platform

#### 8.7.1 Landing Page (`/`)

- Hero: product name, value prop ("Track your AI spend. Get smarter model suggestions."), and CTA buttons linking to Chrome Web Store / Edge Add-ons / Brave (uses Chrome Web Store).
- Features section: 6 feature cards with icons (token tracking, budget alerts, model suggestions, 15+ platforms, web dashboard, privacy-first local storage).
- Supported platforms grid (all 20 platform names with tier badges).
- "How it works" section: 3 steps (Install → Sign in → Track).
- Screenshots/mockup section: extension popup UI and web dashboard preview.
- FAQ section (minimum 6 Q&As — see Section 14.1).
- Footer: Privacy Policy · Terms of Service · GitHub · Contact email.

#### 8.7.2 Auth Pages

- `/signup` — Email input → submit → redirect to `/verify-otp`.
- `/login` — Same flow (backend upserts user on first OTP verification).
- `/verify-otp` — 6 individual digit input boxes, auto-advance on input, resend button (disabled 60s after send), error states for wrong OTP, expired OTP, and too many attempts.
- On success: JWT set as `httpOnly; SameSite=Strict; Secure` cookie, redirect to `/dashboard`.
- `/logout` — Clears cookie, redirects to `/`.

#### 8.7.3 Web Dashboard (`/dashboard`) — Protected

- `WEB-DASH-01` — Requires auth. Unauthenticated users redirected to `/login?redirect=/dashboard`.
- `WEB-DASH-02` — Summary cards: Total tokens this week · Total cost this week · Most-used platform · Most-used model.
- `WEB-DASH-03` — Usage over time chart (Recharts): daily token/cost data for 7 / 30 / 90 day range with a toggle.
- `WEB-DASH-04` — Platform breakdown: donut chart showing usage share per platform.
- `WEB-DASH-05` — Model breakdown table: Model · Platform · Total Tokens · Estimated Cost · Sessions.
- `WEB-DASH-06` — Recent sessions table: last 20 sessions with Date · Platform · Model · Duration · Tokens · Cost.
- `WEB-DASH-07` — Budget widget: progress bar + current week spend + "Edit budget" button.
- `WEB-DASH-08` — If sync is off: banner "Your data is stored locally on your device. Enable sync in Settings to view it here."
- `WEB-DASH-09` — Data fetched from `GET /api/usage` with JWT. Skeleton loaders shown during fetch.

#### 8.7.4 Settings Page (`/settings`) — Protected

- Budget: weekly cap (USD / tokens toggle), notification threshold checkboxes.
- Cloud sync: on/off toggle with a short explainer of what gets synced.
- Preferred models by tier: dropdowns for Quick Q&A, Code, Long-context, Creative.
- Platform toggles: enable/disable tracking per platform.
- Delete all data: confirmation modal → clears backend data + triggers `chrome.storage.local` clear via a message to the extension.

#### 8.7.5 Privacy Policy (`/privacy-policy`) — see Section 14.2
#### 8.7.6 Terms of Service (`/terms`) — see Section 14.3
#### 8.7.7 Cookie Policy (`/cookies`) — see Section 14.4
#### 8.7.8 Custom 404 (`/404`)

---

### 8.8 Cloud Sync

- `SYNC-01` — When enabled, background worker batches new usage events and sends them to `POST /api/sync` with `Authorization: Bearer <jwt>` every 10 minutes (only if there is new data since last sync).
- `SYNC-02` — Backend upserts events by `(user_id, session_id, occurred_at)` unique constraint to prevent duplicates.
- `SYNC-03` — Sync is one-directional: extension → backend. The web dashboard reads from the backend only.
- `SYNC-04` — On sync failure (network error, 401 expired JWT), events are queued locally and retried on the next alarm cycle. After 3 consecutive failures, the user is shown an in-popup notification to re-authenticate.

---

## 9. Non-Functional Requirements

### Performance
- Content scripts: < 5ms additional parse time per AI platform page load.
- Popup load: < 200ms (local storage reads only).
- MutationObserver callbacks: < 20ms to avoid blocking DOM paint.
- Web dashboard initial load: < 2 seconds on a standard connection (Vercel CDN + skeleton loaders).

### Privacy
- Raw message text is used only locally for tokenization and task classification. It is never persisted to `chrome.storage.local` and never sent to the backend or any third party.
- All usage data is stored locally by default. Cloud sync is opt-in and clearly explained.
- OTP records are hard-deleted from the database immediately after successful use. Unused OTPs are deleted when they expire (handled by a scheduled cleanup job running via `node-cron` every hour, deleting rows where `expires_at < NOW() OR used = true`).
- No third-party analytics, advertising SDKs, or tracking pixels in the extension or website.
- The extension only requests permissions required for its function. No broad host permissions beyond the listed platform URLs.

### Browser Compatibility
- **Chrome** 114+ (Manifest V3)
- **Edge** 114+ (Chromium-based, same build as Chrome)
- **Brave** (Chromium-based, same build as Chrome)
- Single unified build using `webextension-polyfill` for any minor API differences.
- Firefox is explicitly out of scope for v1.0.

### Reliability
- Content script selectors maintained in a versioned config file separate from scraper logic. A platform UI change requires only a config patch, not a code release.
- If a platform's DOM cannot be parsed, the extension degrades gracefully: tracking pauses for that platform, and a "Platform temporarily unavailable" message is shown in the popup.
- Backend is stateless (JWT auth) so it can be restarted without affecting users.

---

## 10. Security & Rate Limiting

This section covers all security measures required for public deployment. Every measure here is implemented before any public launch.

### 10.1 Security Middleware Stack (Express)

All middleware is applied globally in this order:

```js
import express     from 'express';
import helmet      from 'helmet';
import cors        from 'cors';
import rateLimit   from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize'; // sanitize inputs
import hpp         from 'hpp';
import compression from 'compression';
import morgan      from 'morgan';

const app = express();

// 1. Security headers (HSTS, CSP, X-Frame-Options, etc.)
app.use(helmet());

// 2. CORS — only allow the website domain and the extension origin
app.use(cors({
  origin: [
    'https://yourwebsite.com',
    'chrome-extension://<YOUR_EXTENSION_ID>'
  ],
  credentials: true,           // allow httpOnly cookies
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body size limits (prevent request body attacks)
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 4. HTTP Parameter Pollution prevention
app.use(hpp());

// 5. Gzip compression
app.use(compression());

// 6. Request logging (Morgan — log to stdout, Railway/Render captures it)
app.use(morgan('combined'));
```

### 10.2 Rate Limiting Rules

All limits use `express-rate-limit` with a Redis store (via `rate-limit-redis`) in production,
or in-memory store for local development. Redis (Upstash free tier) ensures limits are
shared across multiple backend instances and persist across restarts.

#### Global IP rate limit (catch-all)

```js
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 120,                  // 120 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' }
});
app.use('/api', globalLimiter);
```

#### Auth endpoints (strictest limits)

| Endpoint | Window | Max per IP | Max per email | Notes |
|---|---|---|---|---|
| `POST /auth/request-otp` | 10 min | 5 | 3 | Two separate limiters (IP + email body param) |
| `POST /auth/verify-otp` | 10 min | 10 | — | Plus max 5 attempts per OTP (DB-enforced) |
| `POST /auth/logout` | 1 min | 10 | — | No practical limit needed |

```js
// IP-based limiter for OTP request
const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many OTP requests from this IP. Try again in 10 minutes.' }
});

// Email-based limiter for OTP request (prevents targeting a specific user)
const otpEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email?.toLowerCase() ?? req.ip,
  message: { error: 'Too many OTP requests for this email. Try again in 10 minutes.' }
});

router.post('/auth/request-otp', otpIpLimiter, otpEmailLimiter, requestOtpHandler);
```

#### API endpoints (authenticated users)

| Endpoint | Window | Max per user (JWT sub) | Notes |
|---|---|---|---|
| `POST /api/sync` | 1 hour | 12 | Extension syncs every 10 min, so 6/hr normal; 12 gives 2× headroom |
| `GET /api/usage` | 1 min | 30 | Dashboard auto-refreshes; 30/min is generous |
| `PUT /api/settings` | 1 min | 10 | Settings saves |
| `DELETE /api/data` | 1 hour | 3 | Data deletion (safety measure) |

```js
// Per-user JWT limiter (applied after auth middleware)
const userApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user.id,   // set by JWT middleware
  message: { error: 'Request limit reached. Please wait a moment.' }
});
```

### 10.3 Input Validation

All request bodies are validated with `zod` before reaching controller logic.
Invalid inputs return HTTP 400 with a descriptive error (never a stack trace).

```js
import { z } from 'zod';

const requestOtpSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim()
});

const verifyOtpSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  otp:   z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
});

const syncSchema = z.object({
  events: z.array(z.object({
    sessionId:       z.string().uuid(),
    platform:        z.string().max(50),
    model:           z.string().max(100).optional(),
    role:            z.enum(['user', 'assistant']),
    estimatedTokens: z.number().int().positive().max(200000),
    estimatedCostUSD:z.number().nonneg().max(100),
    occurredAt:      z.string().datetime()
  })).max(500)   // cap batch size
});
```

### 10.4 Authentication Security

- JWT secret: minimum 256-bit random value stored in environment variable `JWT_SECRET`. Rotated if compromised.
- JWTs are verified on every protected request using `jsonwebtoken.verify()`. Expired or tampered tokens return HTTP 401.
- Middleware attaches `req.user = { id, email }` after successful verification.
- Refresh strategy: JWTs have a 7-day expiry. If a JWT is within 24 hours of expiry and the user makes any authenticated request, a new JWT is issued (sliding window). This prevents frequent logouts without requiring refresh tokens for v1.0.

```js
export function authenticateJWT(req, res, next) {
  const token = req.cookies.jwt                            // website
    ?? req.headers.authorization?.replace('Bearer ', ''); // extension

  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
```

### 10.5 Database Security

- All database queries go through Prisma ORM — no raw SQL string concatenation. Prisma uses parameterized queries, preventing SQL injection by default.
- Database connection string stored in `DATABASE_URL` environment variable. Never committed to GitHub.
- Supabase row-level security (RLS) enabled: users can only read/write their own rows in `usage_events` and `user_settings`.
- OTP hashes stored with bcrypt (cost factor 10). Raw OTPs are never logged.
- Cleanup job deletes expired and used OTP records every hour via `node-cron`:

```js
import cron from 'node-cron';
cron.schedule('0 * * * *', async () => {
  await prisma.otpRecord.deleteMany({
    where: { OR: [{ used: true }, { expiresAt: { lt: new Date() } }] }
  });
});
```

### 10.6 HTTPS & Transport Security

- All traffic served over HTTPS. HTTP requests redirected to HTTPS (enforced by Vercel for the website and by Railway/Render for the backend).
- `helmet()` sets `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- Cookies set with `Secure` flag (HTTPS-only) and `HttpOnly` (no JS access).

### 10.7 Cloudflare Integration (Free Tier)

Place Cloudflare in front of both the website and backend domain:

- **DDoS protection:** Automatic L3/L4/L7 DDoS mitigation.
- **WAF (Web Application Firewall):** Managed free ruleset blocks common attack patterns (SQLi, XSS, bad bots).
- **Rate limiting:** Cloudflare's free-tier rate limiting can add an additional layer before requests even reach the Express rate limiter.
- **CDN:** Website static assets (JS, CSS, images) cached at Cloudflare edge nodes — reduces Vercel bandwidth and speeds up global load times.
- **SSL/TLS:** Cloudflare issues and manages the SSL certificate. Set encryption mode to "Full (strict)".
- **Bot Fight Mode:** Enabled to block known malicious bots and scrapers.

### 10.8 Environment Variables

Never commit secrets to GitHub. Use `.env` for local development and the platform's secret manager for production:

```bash
# Backend (.env)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...           # Supabase connection string
JWT_SECRET=<256-bit-random-hex>         # openssl rand -hex 32
GMAIL_USER=yourapp@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx # 16-char Google App Password
FRONTEND_URL=https://yourwebsite.com
EXTENSION_ID=<chrome-extension-id>
REDIS_URL=redis://...                   # Upstash Redis (rate limiter store)
```

Add `.env` to `.gitignore`. Document all required variables in `README.md` with placeholder values so contributors know what to set up.

### 10.9 Error Handling

Never expose internal error details in API responses. All unhandled errors go through a global error handler:

```js
app.use((err, req, res, next) => {
  console.error(err);   // logged server-side (Railway/Render captures this)
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'An unexpected error occurred. Please try again.'
      : err.message
  });
});
```

Stack traces, database error details, and internal paths are never returned to the client.

### 10.10 Security Headers (via Helmet)

`helmet()` automatically sets:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Configured per-app to allow only required origins |
| `X-Frame-Options` | `DENY` (prevents clickjacking) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | Disables camera, microphone, geolocation |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

---

## 11. Technical Stack

### Browser Extension

| Layer | Technology |
|---|---|
| Manifest version | V3 |
| Language | TypeScript |
| Popup UI | React 18 + Vite |
| Tokenizer | `js-tiktoken` (cl100k_base) |
| Storage | `chrome.storage.local` |
| Cross-browser polyfill | `webextension-polyfill` |
| Notifications | `chrome.notifications` API |
| Build tool | Vite + `vite-plugin-web-extension` |
| Remote config | Fetch from GitHub raw JSON, cached in storage |

### Website

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts |
| HTTP client | Axios |
| Deployment | Vercel (free tier) |
| CDN / DDoS | Cloudflare (free tier) |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js |
| Language | TypeScript |
| OTP hashing | bcrypt |
| JWT | jsonwebtoken |
| Input validation | zod |
| Email | Nodemailer (Gmail SMTP + App Password) |
| Security headers | helmet |
| Rate limiting | express-rate-limit + rate-limit-redis |
| HTTP param pollution | hpp |
| Compression | compression |
| Logging | morgan |
| Scheduled jobs | node-cron |
| Database | PostgreSQL via Supabase (free tier) |
| ORM | Prisma |
| Rate limiter store | Upstash Redis (free tier) |
| Deployment | Railway or Render (free tier) |

---

## 12. Data Models

### PostgreSQL Schema (via Prisma)

```prisma
// schema.prisma

model User {
  id          String        @id @default(uuid())
  email       String        @unique
  createdAt   DateTime      @default(now())
  usageEvents UsageEvent[]
  settings    UserSettings?
}

model OtpRecord {
  id        String   @id @default(uuid())
  email     String
  otpHash   String
  expiresAt DateTime
  attempts  Int      @default(0)
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
}

model UsageEvent {
  id                String   @id @default(uuid())
  userId            String
  sessionId         String
  platform          String
  model             String?
  role              String   // 'user' | 'assistant'
  estimatedTokens   Int
  estimatedCostUsd  Decimal  @db.Decimal(10, 6)
  occurredAt        DateTime
  syncedAt          DateTime @default(now())
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, sessionId, occurredAt])
  @@index([userId, occurredAt])
}

model UserSettings {
  userId            String   @id
  weeklyLimitUsd    Decimal  @default(5.00) @db.Decimal(8, 2)
  syncEnabled       Boolean  @default(false)
  notify50          Boolean  @default(true)
  notify80          Boolean  @default(true)
  notify100         Boolean  @default(true)
  preferredQuick    String   @default("gpt-4o-mini")
  preferredCode     String   @default("claude-sonnet")
  preferredLong     String   @default("gemini-1.5-pro")
  preferredCreative String   @default("claude-sonnet")
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### chrome.storage.local Schema

```ts
interface Storage {
  jwt?: string;

  // Sessions keyed by "session:<uuid>"
  [key: `session:${string}`]: {
    sessionId:    string;
    platform:     string;
    model:        string;
    startTime:    number;
    lastActive:   number;
    turns:        Array<{ role: 'user'|'assistant'; tokens: number; cost: number; ts: number }>;
    totalTokens:  number;
    totalCostUSD: number;
    warned6k:     boolean;
    warned15k:    boolean;
  };

  // Daily rollups keyed by "day:YYYY-MM-DD"
  [key: `day:${string}`]: {
    totalTokens:  number;
    totalCostUSD: number;
    byPlatform:   Record<string, { tokens: number; costUSD: number }>;
  };

  budget: {
    weeklyLimitUSD:       number;
    weekStartDate:        string; // "YYYY-MM-DD"
    currentWeekUSD:       number;
    notified50:           boolean;
    notified80:           boolean;
    notified100:          boolean;
    notificationsEnabled: boolean;
  };

  prefs: {
    syncEnabled:       boolean;
    lastSyncAt:        number;
    pendingSyncEvents: any[];   // queued if last sync failed
    preferredModels: {
      quickQA:     string;
      code:        string;
      longContext: string;
      creative:    string;
    };
    disabledPlatforms: string[];
  };

  costConfig: {
    lastFetched: number;
    models:      Record<string, { inputPer1k: number; outputPer1k: number }>;
  };
}
```

---

## 13. User Flows

### Flow 1: First-time installation

```
User installs extension from Chrome Web Store / Edge Add-ons
  → Extension popup opens automatically (or on first icon click)
  → 3-screen onboarding slides:
      Screen 1: "What AI Token Tracker does" (brief feature overview)
      Screen 2: "Your privacy" (data stays local by default)
      Screen 3: "Set your weekly budget" (input field, skip option)
  → User is dropped into the main popup view
  → On next visit to any supported AI site, tracking begins silently
```

### Flow 2: Daily usage (returning user)

```
User opens Claude / ChatGPT / Gemini
  → Content script activates (invisible to user)
  → User types and sends a message
  → Background worker tokenizes the message, updates session counter
  → User clicks the extension icon
  → Popup shows: "~342 tokens | ~$0.005 this session | Budget: 34%"
  → Suggestion chip: "[Quick Q&A] → GPT-4o mini would cost ~10× less"
  → User continues chatting; after 20+ turns, context warning banner appears
  → User reads the summarization tip, dismisses the banner, starts fresh
```

### Flow 3: Budget threshold notification

```
User crosses 80% of weekly budget during a ChatGPT session
  → chrome.alarms fires, budget manager detects the threshold
  → Browser notification appears:
      "AI Token Tracker: You're at 80% of your $5.00 weekly budget ($4.02 used)"
  → User clicks the notification → extension popup opens
  → Budget bar shown in red zone with today's breakdown by platform
  → User sees they spent most of the budget on code tasks
  → User navigates to the suggestion chip and decides to switch to a cheaper model
```

### Flow 4: Website sign-up and cloud sync setup

```
User visits yourwebsite.com
  → Reads the landing page, clicks "Add to Chrome"
  → After installing, clicks "Sign In" in the popup → new tab opens at /login
  → Enters email → redirected to /verify-otp
  → Receives Gmail OTP → enters 6 digits → verified
  → JWT set as httpOnly cookie → redirected to /dashboard
  → Dashboard shows "Enable sync to see your data here" (sync is off by default)
  → User clicks "Go to Settings" → toggles "Cloud sync" on
  → Extension detects the setting change on next popup open
  → Within 10 minutes, extension sends first sync batch to POST /api/sync
  → Dashboard reloads → usage charts now populated with real data
```

### Flow 5: Returning to website on another device

```
User opens yourwebsite.com on a different device (e.g. home laptop)
  → Not logged in → /dashboard redirects to /login?redirect=/dashboard
  → Enters email → OTP sent → verified → JWT cookie set
  → Redirected to /dashboard → sees synced usage data from all sessions
  → Extension is not installed on this device → usage data is read-only here
```

---

## 14. Website Pages & Content

### 14.1 Landing Page FAQ Content

**Q: Does AI Token Tracker read my conversations?**  
A: The extension reads message text briefly to estimate token counts — the same way a word processor counts words. This processing happens entirely on your device. The text itself is never saved, sent to our servers, or shared with anyone.

**Q: How accurate are the token counts?**  
A: Token counts are estimates, labeled "~" throughout the app. For OpenAI models, estimates are typically within ±5%. For other model families (Claude, Gemini, Mistral etc.), we use a universal approximation that is generally within ±15%. Exact token counts are only available through official APIs, which this extension does not use.

**Q: Is this extension free?**  
A: Yes, completely free. The source code is open on GitHub under the MIT License.

**Q: Which browsers does it support?**  
A: Chrome, Microsoft Edge, and Brave. All three use the same extension build. Firefox support is planned for a future version.

**Q: Do I need to create an account?**  
A: No. The extension works fully without an account — all your data is stored locally on your device. An account is only needed if you want to sync your usage data to the web dashboard.

**Q: What happens to my data if I uninstall the extension?**  
A: Your local data is removed with the extension. If you had cloud sync enabled, your data on our servers remains until you delete it from the Settings page or contact us to request deletion.

---

### 14.2 Privacy Policy

**Effective date:** [Insert date]  
**Last updated:** [Insert date]

---

**1. Who we are**

AI Token Tracker ("we", "our", "the Service") is a browser extension and companion website operated as an open-source project. Contact: [your email address].

---

**2. What data we collect and why**

**Data processed locally on your device (never sent to us):**

- The text content of messages you send and receive on supported AI chat platforms. This text is read briefly to estimate token counts and classify task type for model suggestions. It is discarded immediately after processing and is never written to any storage.

**Data stored locally on your device (chrome.storage.local):**

- Estimated token counts and cost figures per conversation session.
- The platform and model name detected during each session.
- Your budget settings (weekly limit, notification thresholds).
- Your preference settings (preferred models per task type, disabled platforms).
- An authentication token (JWT) if you choose to sign in.

**Data collected when you create an account (stored on our servers):**

- Your email address — used to send you a one-time verification code. We do not send marketing emails.
- Aggregated usage statistics (token counts, cost estimates, platform, model, session timestamp) — only if you explicitly enable cloud sync. This data is used solely to populate your web dashboard.
- Your budget and preference settings — to sync them across devices when sync is enabled.

**Data we do not collect:**

- The content of your AI conversations (prompts, responses) — never.
- Your browsing history beyond the supported AI platform URLs.
- Personal information beyond your email address.
- Payment information (the Service is free).

---

**3. Legal basis for processing (GDPR)**

If you are located in the European Economic Area, our legal basis for processing your personal data is:

- **Consent** — for cloud sync (you explicitly enable this).
- **Legitimate interests** — for basic account management (email + JWT) to provide the authenticated service you request.
- **Legal obligation** — to comply with applicable laws.

---

**4. How we store and protect your data**

- Your data is stored in a PostgreSQL database hosted on Supabase, which uses AES-256 encryption at rest and TLS in transit.
- One-time passwords (OTPs) are stored as bcrypt hashes — we cannot read them.
- We use HTTPS for all data in transit. Cookies are set with `HttpOnly` and `Secure` flags.
- We implement rate limiting and input validation on all server endpoints.
- We do not sell, rent, or share your data with third parties for advertising or marketing.

---

**5. Third-party services**

We use the following third-party services to operate the platform:

| Service | Purpose | Privacy Policy |
|---|---|---|
| Supabase | Database hosting | supabase.com/privacy |
| Vercel | Website hosting | vercel.com/legal/privacy-policy |
| Railway / Render | Backend API hosting | railway.app/legal/privacy / render.com/privacy |
| Gmail (Google) | Sending OTP emails | policies.google.com/privacy |
| Cloudflare | CDN, DDoS protection | cloudflare.com/privacypolicy |

Each third-party service has its own privacy policy. We recommend reviewing them if you have concerns.

---

**6. Data retention**

- One-time passwords: deleted immediately after successful use, or automatically after expiry (within 1 hour of expiry time).
- Usage data (when sync is enabled): retained until you delete it via the Settings page or request deletion by email.
- Your account (email): retained until you request account deletion.
- Local extension data: stored on your device until you uninstall the extension or clear it via the Settings page.

---

**7. Your rights**

Depending on where you live, you may have the right to:

- **Access** the personal data we hold about you.
- **Correct** inaccurate data.
- **Delete** your data ("right to be forgotten").
- **Export** your data in a machine-readable format.
- **Withdraw consent** for cloud sync at any time via the Settings page.
- **Lodge a complaint** with your local data protection authority.

To exercise any of these rights, email us at [your email]. We will respond within 30 days.

---

**8. Cookies**

The website uses a single cookie: a `jwt` session cookie set after you log in. This cookie is used exclusively to authenticate your requests and is not used for tracking, advertising, or analytics. See our Cookie Policy for details.

---

**9. Children's privacy**

This Service is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it.

---

**10. Changes to this policy**

We may update this Privacy Policy from time to time. Material changes will be noted at the top of this page with a revised "Last updated" date. Continued use of the Service after a change constitutes acceptance of the updated policy.

---

**11. Contact**

For privacy-related questions or to exercise your rights: [your email address]  
Project repository: [your GitHub URL]

---

### 14.3 Terms of Service

**Effective date:** [Insert date]

---

**1. Acceptance of terms**

By installing the AI Token Tracker browser extension or using the website at [yourwebsite.com] ("the Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.

---

**2. Description of the Service**

AI Token Tracker is a free, open-source browser extension and companion website that estimates token usage and costs across AI chat platforms, provides model recommendations, and displays usage analytics. It is provided as-is, free of charge, under the MIT License.

---

**3. Use of the Service**

You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:

- Use the Service in any way that violates any applicable law or regulation.
- Attempt to reverse-engineer, decompile, or tamper with the Service beyond what is permitted by the open-source MIT License.
- Use automated tools to abuse the Service's endpoints in ways that degrade service for other users.
- Misuse the authentication system (e.g. attempting to brute-force OTPs beyond normal use).
- Use the Service to collect or harvest other users' data.

---

**4. Accounts**

An account is optional. You create an account by verifying your email address via one-time password. You are responsible for maintaining the security of your account and for all activity that occurs under it. Notify us immediately at [your email] if you suspect unauthorized access to your account.

We reserve the right to suspend or terminate accounts that violate these Terms.

---

**5. Open-source license**

The source code for AI Token Tracker is published on GitHub under the MIT License. You are free to use, copy, modify, and distribute the code under the terms of that license. These Terms of Service govern your use of the hosted Service, not the source code itself.

---

**6. Disclaimer of warranties**

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:

- Token estimates are accurate or complete.
- The Service will be uninterrupted or error-free.
- Results obtained from the Service will be accurate or reliable.
- AI platform compatibility will be maintained if those platforms change their user interfaces.

Token counts and cost estimates are approximations and should not be used as the basis for financial decisions.

---

**7. Limitation of liability**

TO THE FULLEST EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE SHALL NOT EXCEED ZERO DOLLARS ($0), AS THE SERVICE IS PROVIDED FREE OF CHARGE.

---

**8. Third-party services**

The Service integrates with or links to third-party services (AI platforms, hosting providers). We are not responsible for the content, privacy practices, or availability of any third-party service.

---

**9. Changes to the Service**

We may modify, suspend, or discontinue the Service at any time without notice. We may update these Terms at any time. Material changes will be noted at the top of this page. Continued use of the Service after a change constitutes acceptance of the updated Terms.

---

**10. Governing law**

These Terms are governed by the laws of [Your Country / State], without regard to conflict of law principles.

---

**11. Contact**

Questions about these Terms: [your email address]  
Project repository: [your GitHub URL]

---

### 14.4 Cookie Policy

**Effective date:** [Insert date]

---

**What cookies we use**

AI Token Tracker uses exactly one cookie:

| Cookie | Name | Purpose | Duration | Type |
|---|---|---|---|---|
| Authentication | `jwt` | Keeps you logged in to the web dashboard after verifying your email. | 7 days | Essential |

This cookie is:
- **HttpOnly** — it cannot be accessed by JavaScript on the page, protecting it from XSS attacks.
- **Secure** — it is only transmitted over HTTPS.
- **SameSite=Strict** — it is not sent on cross-site requests, protecting against CSRF attacks.

---

**What we do not use cookies for**

We do not use cookies for advertising, analytics, tracking your browsing activity across other websites, or any purpose other than authentication.

---

**How to control cookies**

You can delete the authentication cookie at any time by clicking "Log out" on the website. You can also clear cookies via your browser settings. Deleting the cookie will log you out of the web dashboard; it has no effect on the extension.

Because we use only an essential authentication cookie, cookie consent banners are not legally required under most regulations. If you have questions, contact us at [your email].

---

### 14.5 Chrome Web Store Data Disclosure

The following information is required for the Chrome Web Store "Privacy practices" submission form:

**Permissions used and why:**

| Permission | Reason |
|---|---|
| `storage` | Store session data, budget settings, preferences, and JWT locally |
| `alarms` | Check budget thresholds and trigger sync on a repeating schedule |
| `notifications` | Send budget threshold alerts to the user |
| `tabs` | Open the website login page in a new tab for the auth flow |
| `scripting` | Inject content scripts into supported AI platform pages |
| Host permissions (listed AI platform URLs) | Allow content scripts to read the chat DOM on supported platforms |

**Data the extension collects:**
- Estimated token counts and cost figures (locally stored).
- Platform and model names detected on supported AI sites (locally stored).
- User preferences and budget settings (locally stored).
- Authentication JWT if the user chooses to sign in (locally stored).

**Data the extension does NOT collect:**
- Message content (processed locally and immediately discarded).
- Browsing history.
- Any data from websites other than the listed supported AI platforms.

**Remote code:** None. The extension does not load or execute remote code.

---

## 15. Extension Structure

```
extension/
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── background/
│   │   ├── index.ts              Service worker entry point
│   │   ├── tokenizer.ts          js-tiktoken wrapper + encoding cache
│   │   ├── budgetManager.ts      Budget checks, chrome.notifications
│   │   ├── suggestionEngine.ts   classifyTask() pure function
│   │   ├── syncManager.ts        Cloud sync batching + retry logic
│   │   └── costConfigFetcher.ts  Fetch + cache remote costs.json
│   ├── content/
│   │   ├── index.ts              Content script entry (injected per platform)
│   │   └── platforms/
│   │       ├── config.ts         Platform config registry (all 20 entries)
│   │       └── scraper.ts        Generic DOM scraper using platform config
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx              React entry point
│   │   ├── App.tsx               Root component + routing within popup
│   │   ├── components/
│   │   │   ├── SessionPanel.tsx
│   │   │   ├── BudgetBar.tsx
│   │   │   ├── SuggestionChip.tsx
│   │   │   ├── ContextWarning.tsx
│   │   │   ├── TodaySummary.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── popup.css
│   ├── onboarding/
│   │   ├── index.html            Shown on first install (chrome.runtime.onInstalled)
│   │   └── Onboarding.tsx
│   └── utils/
│       ├── storage.ts            chrome.storage typed helpers
│       ├── constants.ts          Thresholds, fallback cost table
│       └── types.ts              Shared TypeScript interfaces
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
└── config/
    └── costs.json                Bundled fallback cost table (also served on GitHub)
```

---

## 16. Out of Scope

The following are explicitly excluded from v1.0:

- Exact server-side token counts via user API keys (v2).
- Firefox support (v2).
- Native mobile app.
- Team / organization multi-user accounts.
- AI image generation tracking.
- Prompt injection or modification of user messages.
- Advertising, affiliate links, or in-app purchases.
- Real-time collaboration or shared dashboards.
- Browser history or activity tracking beyond the listed AI platform URLs.

---

## 17. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI platform DOM changes break selectors | High | Medium | Config-driven selector registry. One config update fixes scraping without a code release. Graceful fallback to "tracking paused" state. |
| Gmail SMTP daily limit (500 emails/day) reached | Low | High | Monitor daily OTP email count. Switch to SendGrid free tier (100 emails/day, better deliverability) if approaching limit — requires only a transporter config swap. |
| OTP emails land in spam | Medium | High | Set up SPF and DKIM records on the sending Gmail domain. Use a descriptive, non-spammy subject line. Gmail App Password approach has better deliverability than raw SMTP. |
| Extension ToS conflict with platform scraping | Medium | High | Frame as personal productivity / educational tool. Not sold commercially. Review each platform's ToS before Chrome Web Store submission. |
| Token estimation inaccuracy (non-GPT models) | High | Low | All counts labeled "~" (estimated). Limitation clearly documented in the UI, FAQ, and project report. |
| DDoS or abuse of public auth endpoints | Medium | High | Cloudflare DDoS protection + express rate limiting + per-IP and per-email limits. Requests must pass Cloudflare before reaching Express. |
| JWT secret compromise | Low | High | 256-bit random secret stored as environment variable, never committed to GitHub. Rotate immediately if compromised (all users will need to re-authenticate). |
| Supabase free tier limits | Low | Low | Free tier provides 500MB storage and 2GB bandwidth/month. Sufficient for a college project. Monitor via Supabase dashboard. |
| chrome.storage.local 5MB quota exceeded | Low | Low | Store only token counts and metadata, never raw text. Cap turns per session at 500. Monitor storage usage during development with chrome.storage.local.getBytesInUse(). |
| GitHub raw JSON config fetch fails | Medium | Low | Extension falls back to cached config, then to bundled fallback defaults. Tracking continues with potentially stale cost rates, which is acceptable. |

---

## 18. Milestones & Build Order

### Milestone 1 — Extension Core (Weeks 1–3)
- [ ] Manifest V3 skeleton + Vite + TypeScript build pipeline
- [ ] Platform config for ChatGPT, Claude, Gemini (Tier 1 core)
- [ ] Generic content script scraper driven by platform config
- [ ] Background worker: tokenization + session writes to chrome.storage.local
- [ ] Remote cost config fetcher (GitHub JSON) with local cache + fallback
- [ ] Popup: live token counter and session panel (MVP, no budget/suggestion yet)

### Milestone 2 — Full Platform Coverage + Dashboard (Weeks 4–5)
- [ ] All Tier 2 platforms added to config
- [ ] Daily/weekly rollup logic in background worker
- [ ] Popup: budget bar, today's summary, "View full dashboard" link
- [ ] Tier 3 platforms (best-effort)
- [ ] Extension icon badge showing today's token count

### Milestone 3 — Budget + Notifications (Week 6)
- [ ] Budget manager module + chrome.alarms (5-minute interval)
- [ ] Notifications at 50%, 80%, 100% of weekly budget
- [ ] Context-length warning banner (6k and 15k token thresholds)
- [ ] Popup settings panel (edit budget, toggle notifications, per-platform toggles)

### Milestone 4 — Backend + Auth (Weeks 7–8)
- [ ] Express + TypeScript project setup
- [ ] Prisma + PostgreSQL schema + Supabase connection
- [ ] POST /auth/request-otp + POST /auth/verify-otp + POST /auth/logout
- [ ] Gmail SMTP via Nodemailer (App Password)
- [ ] JWT issuance and verification middleware
- [ ] All security middleware (helmet, cors, rate limiting, zod validation)
- [ ] node-cron OTP cleanup job
- [ ] Upstash Redis for rate limiter store
- [ ] Extension login flow (popup → website tab → JWT back via chrome.runtime.sendMessage)
- [ ] Deploy backend to Railway/Render + point Cloudflare at it

### Milestone 5 — Website (Weeks 9–10)
- [ ] React + Vite + Tailwind CSS project setup
- [ ] Landing page (all sections including FAQ)
- [ ] Auth pages (/signup, /login, /verify-otp)
- [ ] Protected route guard
- [ ] Web dashboard (summary cards, charts, model table, sessions table, budget widget)
- [ ] Settings page (budget, sync toggle, preferred models, platform toggles, data deletion)
- [ ] Privacy Policy page (Section 14.2 content)
- [ ] Terms of Service page (Section 14.3 content)
- [ ] Cookie Policy page (Section 14.4 content)
- [ ] Custom 404 page
- [ ] Deploy to Vercel + point Cloudflare at it

### Milestone 6 — Suggestion Engine + Cloud Sync + Polish (Weeks 11–12)
- [ ] classifyTask() function + suggestion chip in popup
- [ ] Cost-vs-quality hint text
- [ ] POST /api/sync + GET /api/usage backend endpoints
- [ ] Extension sync manager (batch, 10-min interval, retry on failure)
- [ ] Web dashboard reads real synced data
- [ ] Onboarding 3-screen flow (shown on chrome.runtime.onInstalled)
- [ ] Chrome Web Store submission (with privacy disclosure)
- [ ] Edge Add-ons submission (same build)
- [ ] Cross-browser testing (Chrome, Edge, Brave)
- [ ] Bug fixes, edge cases, UI polish, README + contributing guide on GitHub

---

## 19. Resolved Decisions

All open questions from PRD v1.0 are resolved as follows:

| # | Question | Decision |
|---|---|---|
| 1 | SMTP provider | **Gmail SMTP** with Google App Password via Nodemailer. Free, sufficient for project scale (500 emails/day). Switch to SendGrid if limits are approached. |
| 2 | Browser support | **Chrome, Edge, and Brave** — all Chromium-based. Single unified Manifest V3 build with `webextension-polyfill`. Firefox explicitly out of scope for v1.0. |
| 3 | Token cost table update strategy | **Remote GitHub JSON config**, fetched once daily and cached in `chrome.storage.local`. Bundled fallback for offline/failure scenarios. Manual updates to the JSON file keep costs current without requiring an extension release. |
| 4 | Privacy policy authorship | **Generated and included in this PRD** (Section 14.2). Privacy Policy, Terms of Service, Cookie Policy, and Chrome Web Store data disclosure are all included in Section 14. |
| 5 | Open source on GitHub | **Yes, MIT License.** GitHub repo link in the website footer. `LICENSE` file in repo root. All environment variables documented in README with placeholder values. |
| 6 | Public deployment security | **Fully addressed in Section 10**: Helmet security headers, dual-layer rate limiting (per-IP and per-user/email), Zod input validation, bcrypt OTP hashing, parameterized queries via Prisma, Cloudflare DDoS protection and WAF, HTTPS everywhere, httpOnly cookies, global error handler that never exposes internals, and node-cron cleanup jobs for OTP records. |

---

*End of Document — AI Token Tracker PRD v1.1*  
*Open source · MIT License · [your GitHub URL]*