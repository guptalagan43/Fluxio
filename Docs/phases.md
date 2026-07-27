# phases.md
## AI Token Tracker — Build Phases

> This file breaks the full project into discrete, sequenced build phases.
> Each phase produces something testable before the next begins.
> Companion docs: `prd.md` · `architecture.md` · `rules.md`

---

## Phase Overview

| Phase | Name | Deliverable | Weeks |
|---|---|---|---|
| 1 | Monorepo Skeleton | Working repo, all three components boot | 1 |
| 2 | Extension Core | Token tracking works locally on Tier 1 platforms | 2–3 |
| 3 | Full Platform Coverage | All 20 platforms tracked; rollups & badge | 4 |
| 4 | Budget & Notifications | Budget bar, alarms, push alerts, context warnings | 5 |
| 5 | Model Suggestion Engine | classifyTask() live in popup | 6 |
| 6 | Backend & Auth | OTP auth, JWT, all API endpoints, deployed | 7–8 |
| 7 | Website | Landing page, auth UI, dashboard, all legal pages | 9–10 |
| 8 | Cloud Sync | Extension syncs to backend; dashboard shows real data | 11 |
| 9 | Polish & Release | Onboarding, store submission, cross-browser QA | 12 |

---

## Phase 1 — Monorepo Skeleton

**Goal:** Every component can be started without errors. No features yet — just a working foundation.

### Extension (`/extension`)

- [ ] `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`
- [ ] `vite-plugin-web-extension` configured; output goes to `dist/`
- [ ] `manifest.json` with all 20 platform `matches`, correct permissions (`storage`, `alarms`, `notifications`, `tabs`), `externally_connectable` pointing to the website domain
- [ ] Folder structure created: `src/background/`, `src/content/`, `src/popup/`, `src/onboarding/`, `src/utils/`
- [ ] `src/utils/types.ts` — all TypeScript interfaces: `Session`, `Turn`, `Budget`, `DayRollup`, `Prefs`, `CostConfig`, `SuggestionResult`, `PlatformConfig`, `ExtensionMessage`
- [ ] `src/utils/constants.ts` — `MAX_TURNS_PER_SESSION`, `SESSION_IDLE_TIMEOUT_MS`, `BUDGET_THRESHOLDS`, `WARNING_THRESHOLDS`
- [ ] `src/utils/storage.ts` — all typed `chrome.storage.local` helpers: `getSession`, `setSession`, `getBudget`, `setBudget`, `getPrefs`, `setPrefs`, `getDayRollup`, `setDayRollup`
- [ ] `src/utils/time.ts` — `getWeekStart()`, `formatDuration()`, `isNewWeek()`
- [ ] `src/background/index.ts` — empty message router and alarm listener stubs
- [ ] `src/content/index.ts` — stub (no platform config yet)
- [ ] `src/popup/index.html` + `src/popup/main.tsx` — renders `<App />` with placeholder text
- [ ] `public/icons/` — placeholder PNGs for 16, 32, 48, 128px
- [ ] `config/costs.json` — bundled fallback cost table (initial values from PRD Section 7)
- [ ] `npm run dev` loads the extension unpacked in Chrome without errors
- [ ] `npm run build` produces a valid `dist/` folder

### Website (`/website`)

- [ ] `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- [ ] `src/main.tsx` + `src/App.tsx` with `RouterProvider`
- [ ] `src/router.tsx` — all routes stubbed (each page renders a `<div>` with its name)
- [ ] `src/api/client.ts` — Axios instance with `baseURL`, `withCredentials: true`, 401 interceptor
- [ ] `src/api/auth.ts` + `src/api/usage.ts` — function stubs (return `Promise` but no real logic yet)
- [ ] `src/contexts/AuthContext.tsx` — `user`, `loading`, `login()`, `logout()` (stub, always `user = null`)
- [ ] `src/types/domain.ts` + `src/types/api.ts` — all shared types
- [ ] `npm run dev` starts without errors at `localhost:5173`

### Backend (`/backend`)

- [ ] `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `Procfile`
- [ ] `src/server.ts` — `app.listen()` with graceful `SIGTERM` shutdown
- [ ] `src/app.ts` — all middleware registered in correct order: `helmet`, `cors`, `body-parser`, `hpp`, `compression`, `morgan`, global rate limiter, route mounts, `notFoundHandler`, `errorHandler`
- [ ] `src/config/env.ts` — startup validation for all required env vars; `process.exit(1)` if any missing
- [ ] `src/config/prisma.ts` — singleton `PrismaClient`
- [ ] `prisma/schema.prisma` — full schema: `User`, `OtpRecord`, `UsageEvent`, `UserSettings` with all indexes and unique constraints from architecture Section 9
- [ ] `src/middleware/errorHandler.ts` — global error handler (never leaks stack traces)
- [ ] `src/middleware/notFoundHandler.ts`
- [ ] `src/routes/health.ts` — `GET /health` returns `{ status: 'ok', timestamp }`
- [ ] `npm run dev` starts at `localhost:3000`; `GET /health` returns 200

### Monorepo Root

- [ ] `README.md` with setup instructions for all three components
- [ ] Root `.gitignore` covering `node_modules/`, `dist/`, `.env`, `*.zip`, `.DS_Store`
- [ ] `LICENSE` — MIT
- [ ] `config/costs.json` at repo root (fetched by extension daily)

**Phase 1 exit criteria:** All three `npm run dev` commands run without errors. Chrome loads the extension unpacked without manifest errors.

---

## Phase 2 — Extension Core (Token Tracking)

**Goal:** Token tracking works end-to-end on ChatGPT, Claude, and Gemini. The popup shows a live token counter updated by real messages.

### Platform Config (Tier 1 only)

- [ ] `src/content/platforms/config.ts` — platform config entries for:
  - `chatgpt` (chatgpt.com + chat.openai.com)
  - `claude` (claude.ai)
  - `gemini` (gemini.google.com)
  - Each entry: `id`, `name`, `matchUrls`, `selectors` (messageContainer, userMessage, assistantMessage, modelLabel), `tokenizerEncoding`
- [ ] `src/content/platforms/scraper.ts` — `waitForElement()` with timeout, `attachObserver()` with disconnect-before-reconnect, `extractMessage()`, `extractModel()`, SPA navigation detection via `popstate` + `pushState` override

### Content Script

- [ ] `src/content/index.ts` — matches current URL against platform configs, calls `initScraper(platformConfig)`, catches all errors per-platform (one failure must not affect others), handles SPA route changes

### Background Service Worker

- [ ] `src/background/tokenizer.ts` — `js-tiktoken` wrapper; caches encoder instance; `estimateTokens(text, encoding): number`
- [ ] `src/background/sessionManager.ts` — `handleNewMessage()`, `getActiveSession()`, `writeSessionTurn()`, `updateDailyRollup()`, `cleanupInactiveSessions()`; session keyed by `session:<tabId>`; on `chrome.tabs.onRemoved`, move to permanent `session:<uuid>` key; turns capped at 500 with aggregation
- [ ] `src/background/costConfigFetcher.ts` — `fetchAndCache()`: fetches GitHub raw JSON, falls back to cached version, then bundled `config/costs.json`
- [ ] `src/background/index.ts` — complete message router: `NEW_MESSAGE`, `GET_SESSION`, `GET_SUMMARY`, `AUTH_SUCCESS`, `DISMISS_SUGGESTION`, `DISMISS_WARNING`; `chrome.alarms.onAlarm` router (stubs for alarms not yet implemented); `chrome.runtime.onInstalled` — creates all four alarms with `chrome.alarms.clearAll()` first, opens onboarding tab

### Popup (MVP)

- [ ] `src/popup/hooks/useStorage.ts` — subscribes to `chrome.storage.onChanged`; returns live storage snapshot; triggers re-render on change
- [ ] `src/popup/hooks/useActiveSession.ts` — derives active session for current tab
- [ ] `src/popup/components/Header.tsx` — platform icon + model name
- [ ] `src/popup/components/SessionPanel.tsx` — live token counter, cost (4 decimal places), session duration
- [ ] `src/popup/App.tsx` — reads storage via `useStorage`, renders `Header` + `SessionPanel` only (other panels in later phases)
- [ ] `src/popup/popup.css` — base Tailwind styles; popup width fixed at 320px

**Phase 2 exit criteria:** Open chatgpt.com, send a message, click the extension icon — popup shows `~N tokens | ~$0.00XX`. Counter increments on each new message. Works the same on claude.ai and gemini.google.com.

---

## Phase 3 — Full Platform Coverage + Daily Rollups

**Goal:** All 20 platforms tracked. Daily/weekly rollups maintained. Popup shows today's summary and a "View dashboard" link.

### Platform Config (Tier 2 + Tier 3)

- [ ] Add to `src/content/platforms/config.ts`:
  - Tier 2: `grok`, `deepseek`, `mistral`, `huggingchat`, `poe`, `qwen`
  - Tier 3: `groq`, `youcom`, `kimi`, `pi`, `openrouter`, `cohere`, `characterai`, `bing`
- [ ] For aggregator platforms (Poe, OpenRouter, HuggingChat): attempt to extract underlying model; fall back to aggregator name

### Background Service Worker — Rollups

- [ ] `src/background/sessionManager.ts` — add `updateWeeklyBudget()` called on every `handleNewMessage`; weekly `currentWeekUSD` accumulates alongside daily rollups
- [ ] `src/utils/time.ts` — implement `getWeekStart()` and `isNewWeek()` fully; used by budget manager (Phase 4) and rollup logic

### Popup — Today's Summary

- [ ] `src/popup/components/TodaySummary.tsx` — today's tokens, today's cost, platform icon row (one icon per distinct platform used today)
- [ ] `src/popup/App.tsx` — add `TodaySummary` below `SessionPanel`; add "View full dashboard ↗" footer link (opens `https://yourwebsite.com/dashboard` in new tab)

### Extension Icon Badge

- [ ] `src/background/sessionManager.ts` — after each `updateDailyRollup`, update the extension badge text: `chrome.action.setBadgeText({ text: formatBadge(todayTokens) })` (e.g. `"14k"`); `chrome.action.setBadgeBackgroundColor({ color: '#6366f1' })`

**Phase 3 exit criteria:** Open any of the 20 supported platforms, send messages, click the extension icon — `TodaySummary` shows accurate totals. The badge on the extension icon updates after each message. Platforms not in the config degrade gracefully (no crash, no tracking).

---

## Phase 4 — Budget Management & Notifications

**Goal:** Users can set a weekly budget. The popup shows a budget bar. Browser notifications fire at 50%, 80%, and 100%. Context-length warnings appear in the popup.

### Budget Manager

- [ ] `src/background/budgetManager.ts` — `checkThresholds()`: reads `budget` from storage; resets if `isNewWeek()`; fires `chrome.notifications.create()` at 50%, 80%, 100%; each fires only once per period via `notified50/80/100` flags; skips all if `!notificationsEnabled`
- [ ] `src/background/index.ts` — wire `chrome.alarms.onAlarm` case `'budget-check'` → `budgetManager.checkThresholds()`; wire `'cost-config'` alarm → `costConfigFetcher.fetchAndCache()`; wire `'session-cleanup'` alarm → `sessionManager.cleanupInactiveSessions()`

### Popup — Budget Bar

- [ ] `src/popup/components/BudgetBar.tsx` — progress bar 0–100%; color: green → amber at 60% → red at 80%; shows `$currentWeekUSD / $weeklyLimitUSD this week`
- [ ] `src/popup/components/SettingsPanel.tsx` — inline settings (shown when ⚙ clicked): weekly budget USD input + save button; notification threshold checkboxes (50%, 80%, 100%); cloud sync toggle (non-functional until Phase 8); tracked platform on/off toggles
- [ ] `src/popup/components/SignInPrompt.tsx` — shown when JWT absent and user clicks "View dashboard"
- [ ] `src/popup/App.tsx` — add `BudgetBar`, settings cog icon, `SettingsPanel` (shown/hidden with local state), `SignInPrompt` modal

### Context-Length Warning

- [ ] `src/background/sessionManager.ts` — set `session.warned6k = true` when `session.totalTokens > 6000` (once per session); set `session.warned15k = true` at 15,000 tokens
- [ ] `src/popup/components/ContextWarning.tsx` — banner with "This chat is getting long…"; two actions: "How to summarize" (expands a 2-sentence tip inline) and "Dismiss for this session" (sends `DISMISS_WARNING` message)
- [ ] `src/popup/App.tsx` — render `ContextWarning` when `session.warned6k && !dismissed`

**Phase 4 exit criteria:** Set a $1 weekly budget. Spend past $0.50 — a browser notification fires. Open a long conversation past 6,000 tokens — the warning banner appears in the popup. The budget bar updates live as messages are sent.

---

## Phase 5 — Model Suggestion Engine

**Goal:** After each user message, the popup shows a suggestion chip with the detected task type and recommended model.

### Suggestion Engine

- [ ] `src/background/suggestionEngine.ts` — `classifyTask(text: string, sessionTokens: number, budgetRemainingUSD: number): SuggestionResult` as a pure function (no storage reads, fully testable); scoring per category: `quickQA`, `code`, `longContext`, `creative`, `research` per PRD Section 8.5; budget override if `budgetRemainingUSD < weeklyLimitUSD * 0.20`; returns `{ category, tier, recommendedModel, hint, budgetWarning }`
- [ ] `src/background/sessionManager.ts` — call `classifyTask()` after each `NEW_MESSAGE` (role: `'user'`) and store result in `session.lastSuggestion`
- [ ] `src/background/index.ts` — wire `DISMISS_SUGGESTION` message → clear `session.lastSuggestion`

### Popup — Suggestion Chip

- [ ] `src/popup/components/SuggestionChip.tsx` — colored pill: `[{category}] → {recommendedModel}`; clicking expands `hint` text below the chip; "×" dismiss button sends `DISMISS_SUGGESTION`
- [ ] `src/popup/App.tsx` — render `SuggestionChip` when `session.lastSuggestion` exists and not dismissed

**Phase 5 exit criteria:** Send a message with code keywords on any platform — the chip shows `[Code] → Claude Sonnet`. Send a short factual question — chip shows `[Quick Q&A] → GPT-4o mini`. Clicking the chip reveals the hint text. Dismissing removes the chip for the session.

---

## Phase 6 — Backend & Authentication

**Goal:** The backend is live and publicly accessible. OTP email auth works end-to-end. The extension login flow delivers a JWT to the extension popup.

### Backend — Auth

- [ ] `prisma/migrations/` — run `prisma migrate dev --name initial` to generate migration files
- [ ] `src/schemas/auth.schemas.ts` — `requestOtpSchema`, `verifyOtpSchema` with all Zod rules from PRD Section 10.3
- [ ] `src/schemas/api.schemas.ts` — `syncSchema`, `updateSettingsSchema`
- [ ] `src/middleware/validate.ts` — `validate(schema)` middleware factory
- [ ] `src/middleware/rateLimiters.ts` — all rate limiter instances: `globalRateLimiter`, `otpIpLimiter`, `otpEmailLimiter`, `otpVerifyLimiter`, `userApiLimiter`, `syncLimiter`, `settingsLimiter`, `dataDeleteLimiter`; Redis store via `rate-limit-redis` + Upstash; in-memory fallback for local dev
- [ ] `src/middleware/authenticateJWT.ts` — reads JWT from cookie OR `Authorization: Bearer` header; sets `req.user = { id, email }`; returns 401 on failure
- [ ] `src/services/emailService.ts` — `sendOtpEmail(email, otp)` via Nodemailer + Gmail SMTP App Password; OTP email template from PRD Section 8.1
- [ ] `src/services/authService.ts` — `generateOtp()`, `hashOtp()`, `saveOtpRecord()`, `verifyOtpRecord()`, `issueJWT()`, `upsertUser()`; multi-step writes use `prisma.$transaction()`; services return `Result<T>`, never throw
- [ ] `src/controllers/authController.ts` — `requestOtp()`, `verifyOtp()`, `logout()`, `me()` — thin controllers, one service call each
- [ ] `src/routes/auth.ts` — registers routes in order: `otpIpLimiter → otpEmailLimiter → validate → controller`
- [ ] `src/jobs/otpCleanup.ts` — `node-cron` job every hour: `DELETE WHERE used=true OR expiresAt < NOW()`

### Backend — Deployment

- [ ] Set all environment variables in Railway dashboard (from `backend/.env.example`)
- [ ] Connect GitHub repo to Railway; verify `GET https://api.yourwebsite.com/health` returns 200
- [ ] Point Cloudflare `CNAME: api` → Railway domain; enable Cloudflare proxy
- [ ] Verify HTTPS, HSTS header, CORS only allows `yourwebsite.com` and the extension origin

### Extension — Login Flow

- [ ] `src/background/index.ts` — handle `AUTH_SUCCESS` message: `chrome.storage.local.set({ jwt: token })`, close the login tab, update popup state
- [ ] `src/popup/components/SignInPrompt.tsx` (update) — "Sign In" button calls `chrome.tabs.create({ url: 'https://yourwebsite.com/login?source=extension&extId=EXTENSION_ID' })`

**Phase 6 exit criteria:** Click "Sign In" in the extension popup → new tab opens at `/login` → enter email → receive OTP in Gmail inbox within 30 seconds → enter OTP → the login tab closes, the popup shows logged-in state. `GET /health` returns 200 on the live Railway URL. Hitting `/auth/request-otp` more than 5 times in 10 minutes returns 429.

---

## Phase 7 — Website

**Goal:** The full website is live on Vercel with all pages: landing, auth, dashboard, settings, and all legal pages.

### Layout & Shared UI

- [ ] `src/layouts/PublicLayout.tsx` — header (logo + nav: Features, Platforms, FAQ, Sign In), footer (Privacy · Terms · Cookies · GitHub · contact email)
- [ ] `src/layouts/ProtectedLayout.tsx` — sidebar nav (Dashboard, Settings), user menu (email + logout)
- [ ] `src/components/ui/` — `Button`, `Input`, `Card`, `Badge`, `Spinner`, `Skeleton`, `Modal`, `Toggle`, `Tooltip`

### Auth Pages

- [ ] `src/pages/SignupPage.tsx` / `LoginPage.tsx` — `EmailForm` component; `POST /auth/request-otp`; navigate to `/verify-otp` on success; error message on failure
- [ ] `src/pages/VerifyOtpPage.tsx` — `OtpInput` component: 6 individual digit boxes with auto-advance, paste handling, backspace navigation; "Resend" button disabled for 60s; `POST /auth/verify-otp`; on success, redirect to `/dashboard` (or `?redirect=` param); handle `source=extension` — calls `chrome.runtime.sendMessage(extId, { type: 'AUTH_SUCCESS', token })`
- [ ] `src/contexts/AuthContext.tsx` (implement fully) — `GET /auth/me` on mount to restore session from cookie; `login()` sets user; `logout()` calls `POST /auth/logout` then clears user
- [ ] `src/router.tsx` — `ProtectedRoute` guard fully implemented; redirects to `/login?redirect=<path>` when unauthenticated

### Landing Page

- [ ] `src/pages/LandingPage.tsx` with sections:
  - `src/components/landing/Hero.tsx` — headline, value prop, CTA buttons (Chrome Web Store URL, Edge Add-ons URL, Brave = Chrome Web Store)
  - `src/components/landing/Features.tsx` — 6 feature cards with icons
  - `src/components/landing/Platforms.tsx` — all 20 platforms with tier badges
  - `src/components/landing/HowItWorks.tsx` — 3-step visual: Install → Sign in → Track
  - `src/components/landing/Screenshots.tsx` — mockup images of popup + dashboard
  - `src/components/landing/FAQ.tsx` — accordion, minimum 6 Q&As from PRD Section 14.1
  - `src/components/landing/Footer.tsx`

### Dashboard Page

- [ ] `src/contexts/DashboardContext.tsx` — fetches `GET /api/usage?range=7d` on mount; re-fetches on range change; exposes `{ usageData, loading, error, range, setRange, refetch }`
- [ ] `src/components/dashboard/SummaryCards.tsx` — 4 stat cards: total tokens this week, total cost, top platform, top model
- [ ] `src/components/dashboard/UsageChart.tsx` — Recharts `LineChart` or `BarChart`; 7d/30d/90d toggle; skeleton while loading
- [ ] `src/components/dashboard/PlatformDonut.tsx` — Recharts `PieChart` showing platform share
- [ ] `src/components/dashboard/ModelTable.tsx` — sortable: model · platform · tokens · cost · sessions
- [ ] `src/components/dashboard/SessionsTable.tsx` — last 20 sessions: date · platform · model · duration · tokens · cost
- [ ] `src/components/dashboard/BudgetWidget.tsx` — progress bar + spend + "Edit budget" button
- [ ] `src/components/dashboard/SyncBanner.tsx` — shown when sync is off: "Enable sync in Settings to view your data here"
- [ ] `src/pages/DashboardPage.tsx` — composes all dashboard components; loading skeleton states for every component

### Settings Page

- [ ] `src/components/settings/BudgetSettings.tsx` — weekly cap input + notification checkboxes
- [ ] `src/components/settings/SyncToggle.tsx` — on/off toggle + explainer
- [ ] `src/components/settings/ModelPrefs.tsx` — 4 dropdowns: Quick Q&A, Code, Long-context, Creative
- [ ] `src/components/settings/PlatformToggles.tsx` — list of all 20 platforms with enable/disable
- [ ] `src/components/settings/DeleteDataModal.tsx` — confirmation modal; `DELETE /api/data` on confirm
- [ ] `src/pages/SettingsPage.tsx` — composes all settings components; `PUT /api/settings` on save; success/error toast

### Legal Pages

- [ ] `src/pages/PrivacyPolicyPage.tsx` — content from PRD Section 14.2
- [ ] `src/pages/TermsPage.tsx` — content from PRD Section 14.3
- [ ] `src/pages/CookiesPage.tsx` — content from PRD Section 14.4
- [ ] `src/pages/NotFoundPage.tsx` — custom 404

### Backend — API Endpoints for Dashboard

- [ ] `src/services/usageService.ts` — `getUsageForUser(userId, range)`: queries `UsageEvent`, aggregates `daily`, `byPlatform`, `byModel`, `recentSessions` per the `GET /api/usage` response spec in architecture Section 7.3
- [ ] `src/services/settingsService.ts` — `getUserSettings()`, `updateUserSettings()`, `deleteUserData()`
- [ ] `src/controllers/apiController.ts` — `getUsage()`, `getSettings()`, `updateSettings()`, `deleteData()`; thin, calls service only
- [ ] `src/routes/api.ts` — all `/api/*` routes with `authenticateJWT` + per-route rate limiters + `validate` middleware before each controller

### Website — Deployment

- [ ] Connect GitHub to Vercel; set `VITE_API_URL` env var; verify auto-deploy works
- [ ] Point Cloudflare to Vercel; SSL Full (strict); Bot Fight Mode on
- [ ] Verify `https://yourwebsite.com` loads, landing page renders, `/login` OTP flow works end-to-end against live backend

**Phase 7 exit criteria:** The full website is live. A new user can: visit the landing page → sign up → verify OTP → reach `/dashboard` (initially empty with the sync banner) → visit `/settings` → view Privacy Policy / Terms / Cookies. The ProtectedRoute redirects unauthenticated users to `/login`.

---

## Phase 8 — Cloud Sync

**Goal:** The extension syncs usage data to the backend every 10 minutes. The web dashboard shows real tracked data.

### Backend — Sync Endpoint

- [ ] `src/services/syncService.ts` — `batchUpsertEvents(userId, events)`: `prisma.usageEvent.createMany({ skipDuplicates: true })` using the `@@unique([userId, sessionId, occurredAt])` constraint; returns `{ synced, duplicatesSkipped }`
- [ ] `src/controllers/apiController.ts` — add `sync()` controller
- [ ] `src/routes/api.ts` — add `POST /api/sync` with `syncLimiter` + `validate(syncSchema)` + `authenticateJWT`

### Extension — Sync Manager

- [ ] `src/background/syncManager.ts` — `checkAndSync()`: checks `prefs.syncEnabled` and JWT presence; gathers events since `prefs.lastSyncAt`; `POST /api/sync` with `Authorization: Bearer <jwt>`; on success: clears pending events + updates `prefs.lastSyncAt`; on failure: queues events in `prefs.pendingSyncEvents`, increments `prefs.syncFailCount`; after 3 consecutive failures: sets a flag that popup reads to show re-auth notice
- [ ] `src/background/index.ts` — wire `'sync'` alarm → `syncManager.checkAndSync()`

### Extension — Settings Refresh on Popup Open

- [ ] `src/popup/App.tsx` — on popup open, if `prefs.syncEnabled && jwt`: call `GET /api/settings`; merge returned settings into `prefs` in `chrome.storage.local` (refreshes `preferredModels`, `weeklyLimitUSD`, `disabledPlatforms`)

### Dashboard — Live Data

- [ ] `src/components/dashboard/SyncBanner.tsx` — hide banner once `usageData.recentSessions.length > 0`
- [ ] End-to-end test: send messages on a supported platform → wait up to 10 minutes (or trigger sync manually) → refresh `/dashboard` → charts and tables populate with real data

**Phase 8 exit criteria:** Enable sync in extension settings. Send 10+ messages across 2+ platforms. Wait 10 minutes (or shorten `periodInMinutes` temporarily for testing). Open `/dashboard` — charts show real data. Disable sync — `SyncBanner` reappears.

---

## Phase 9 — Polish, Onboarding & Release

**Goal:** The product is submission-ready. Chrome Web Store listing is live. All known bugs are fixed.

### Extension — Onboarding

- [ ] `src/onboarding/index.html` + `src/onboarding/main.tsx`
- [ ] `src/onboarding/components/Onboarding.tsx` — 3-screen stepper with progress dots
- [ ] `src/onboarding/components/Step1Welcome.tsx` — "What AI Token Tracker does" (feature list)
- [ ] `src/onboarding/components/Step2Privacy.tsx` — "Your data stays on your device by default" (clear, honest)
- [ ] `src/onboarding/components/Step3Budget.tsx` — budget input + skip button; saves to `chrome.storage.local` on submit
- [ ] `src/background/index.ts` — confirm `chrome.runtime.onInstalled` only opens onboarding on `reason === 'install'` (not on update)

### Cross-Browser QA

- [ ] Load unpacked `dist/` in Chrome — full manual smoke test of all popup states
- [ ] Load unpacked `dist/` in Edge — verify all features work identically
- [ ] Load unpacked `dist/` in Brave — verify all features work identically
- [ ] Test on all Tier 1 platforms; spot-check Tier 2; note any selector failures in Tier 3 and document graceful fallback behavior

### UI Polish

- [ ] Popup: verify 320px width renders correctly; no overflow; all text fits without wrapping awkwardly
- [ ] Website: verify responsive layout on mobile (375px) and desktop (1280px+) for all pages
- [ ] All loading skeleton states render correctly
- [ ] All error states show user-facing messages (never raw errors)
- [ ] Empty states: dashboard with no synced data, no sessions today, zero budget used

### GitHub Release

- [ ] `README.md` — final version: project description, screenshots, local setup steps for all three components, environment variable reference, contributing guide
- [ ] `.env.example` files committed for backend and extension with all keys and placeholder values
- [ ] All secrets confirmed absent from git history (run `git log -p | grep -i secret` as a sanity check)
- [ ] GitHub repo set to Public
- [ ] `CONTRIBUTING.md` — how to add a new platform (update `config.ts`, no other changes needed)

### Chrome Web Store Submission

- [ ] `npm run zip` — produces `ai-token-tracker-v1.0.0.zip`
- [ ] Chrome Web Store developer account set up (one-time $5 fee)
- [ ] Store listing: name, description (up to 132 chars), detailed description, category (Productivity), screenshots (1280×800 or 640×400, min 1, max 5), promo tile (440×280)
- [ ] Privacy Practices form: justify each permission per PRD Section 14.5; declare data collected; confirm no remote code execution
- [ ] Submit for review (1–3 business days)
- [ ] Update landing page Hero CTA buttons with the live Chrome Web Store URL once approved

### Edge Add-ons Submission

- [ ] Same `dist/` zip works for Edge (no rebuild needed)
- [ ] Submit to Edge Add-ons developer portal
- [ ] Update landing page Edge CTA button once approved

**Phase 9 exit criteria:** The extension is live on the Chrome Web Store. The website is live on Vercel. A brand-new user can install the extension, complete onboarding, track tokens on Claude or ChatGPT, see a budget notification, sign up on the website, enable sync, and view their data on the dashboard — entirely without touching any config or code.

---

## Cross-Phase Rules

These apply at every phase and are never relaxed:

- Follow `rules.md` exactly in every coding session — paste it at the start
- Generate one complete file per AI session; no `// ... rest of code` placeholders
- Never commit `.env` files, even during development
- A phase is complete only when its exit criteria pass — do not start the next phase with unresolved blockers
- Selectors for new platform configs go only in `src/content/platforms/config.ts` — no platform-specific logic in `scraper.ts`
- Security middleware (helmet, CORS, rate limiters, zod validation) is active from the moment the backend is first deployed in Phase 6 — never disabled for convenience

---

*End of Document — AI Token Tracker phases.md*
*Companion docs: prd.md v1.1 · architecture.md v1.0 · rules.md*