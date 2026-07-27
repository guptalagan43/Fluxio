# rules.md
## AI Token Tracker — Vibe Coding Rules

> This file is the single source of truth for how code is written in this project.
> Paste it at the start of every AI coding session. The AI must follow these rules
> exactly. No exceptions, no "better alternatives", no unrequested upgrades.

---

## 0. Quick Project Identity

```
Three components, one monorepo:
  /extension   → Manifest V3, TypeScript, React popup, js-tiktoken
  /website     → React + Vite + Tailwind CSS, React Router v6, Axios, Recharts
  /backend     → Node.js 20, Express 4, TypeScript, Prisma 5, PostgreSQL, Zod

Auth:          Email OTP → bcrypt hash → JWT (HS256, 7-day)
Email:         Nodemailer + Gmail SMTP App Password
Browser:       Chrome, Edge, Brave (Chromium only, Manifest V3)
Deployment:    Extension → Chrome Web Store | Website → Vercel | Backend → Railway
Docs:          prd.md (what to build) · architecture.md (how it fits together)
```

---

## 1. Cardinal Rules (Apply Everywhere)

### 1.1 Read the architecture first
Before generating any file, reference `architecture.md` for:
- Where the file lives in the folder structure
- What the file is responsible for (and what it is NOT)
- Which other files it imports from

### 1.2 One file at a time
Generate one complete file per response. Do not generate partial files
with `// ... rest of the code` placeholders. If a file is too long,
say so and ask which section to write first.

### 1.3 Never rename established things
The folder structure, file names, function names, API endpoint paths,
storage keys, and database column names in `architecture.md` and `prd.md`
are locked. Do not rename them, even if a "better" name exists.
Ask before changing any established name.

### 1.4 No unrequested features
Only generate code for what was asked. Do not add:
- Extra utility functions "that might be useful"
- Additional API endpoints "for completeness"
- Extra UI components "just in case"
- Logging statements beyond what was requested
- Comments explaining what the next developer might want to add

### 1.5 Prefer boring, explicit code over clever code
Write code a junior developer can read without googling.
No chained one-liners. No overuse of array methods.
No "clever" abstractions. Explicit `if/else` over ternary chains.
Readable > short.

### 1.6 TypeScript: strict mode, no `any`
All three components use TypeScript in strict mode.
`any` is banned. `unknown` is acceptable where type is genuinely unknown.
Use `as` type assertions only when there is no other option, and add a
comment explaining why.

### 1.7 Never invent data
Do not hardcode fake placeholder data (e.g. `{ name: 'John', tokens: 1234 }`)
in production code. Use empty states, loading states, or real data from
storage/API. Placeholder data is allowed only in Storybook stories or
isolated test fixtures.

---

## 2. TypeScript Rules

```ts
// ✅ CORRECT — explicit return types on all exported functions
export function estimateTokens(text: string): number {
  return encode(text).length;
}

// ❌ WRONG — missing return type
export function estimateTokens(text: string) {
  return encode(text).length;
}
```

```ts
// ✅ CORRECT — named interfaces in types.ts, not inline
// In types.ts:
export interface Session {
  sessionId:    string;
  platform:     string;
  model:        string;
  totalTokens:  number;
  totalCostUSD: number;
}

// In component:
import type { Session } from '../types';
function SessionPanel({ session }: { session: Session }) { ... }

// ❌ WRONG — inline object types in component props
function SessionPanel({ session }: { session: { sessionId: string; platform: string } }) { ... }
```

```ts
// ✅ CORRECT — zod schema IS the source of truth for request types
const schema = z.object({ email: z.string().email() });
type RequestBody = z.infer<typeof schema>;   // derive type from schema, don't duplicate

// ❌ WRONG — separate interface that can drift from the zod schema
interface RequestBody { email: string; }
const schema = z.object({ email: z.string().email() });
```

```ts
// ✅ CORRECT — discriminated union for results (no throwing in services)
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: string };

// ❌ WRONG — throw errors from service layer (controllers catch, not services)
async function getUserSettings(userId: string) {
  const settings = await prisma.userSettings.findUnique(...);
  if (!settings) throw new Error('Not found');  // ❌
  return settings;
}
```

---

## 3. Extension Rules

### 3.1 Storage: always use the typed helpers
All reads and writes to `chrome.storage.local` go through `utils/storage.ts`.
Never call `chrome.storage.local.get()` or `.set()` directly in a component
or service. Always use the typed wrapper functions.

```ts
// ✅ CORRECT
import { getBudget, setBudget } from '../utils/storage';
const budget = await getBudget();

// ❌ WRONG — raw chrome API call outside of storage.ts
const result = await chrome.storage.local.get('budget');
const budget = result.budget;
```

### 3.2 Messaging: always type the message
Every `chrome.runtime.sendMessage` call uses a typed discriminated union.
Never send untyped objects.

```ts
// In types.ts — the message union
export type ExtensionMessage =
  | { type: 'NEW_MESSAGE';        payload: NewMessagePayload }
  | { type: 'GET_SESSION';        tabId: number }
  | { type: 'AUTH_SUCCESS';       token: string }
  | { type: 'DISMISS_SUGGESTION'; sessionId: string }
  | { type: 'DISMISS_WARNING';    sessionId: string };

// ✅ CORRECT
chrome.runtime.sendMessage<ExtensionMessage>({ type: 'AUTH_SUCCESS', token });

// ❌ WRONG
chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS', token });   // untyped
```

### 3.3 Content scripts: never import from background or popup
Content scripts run in a different context. They can only import from:
- `utils/types.ts`
- `utils/constants.ts`
- `content/platforms/config.ts`
- `content/platforms/scraper.ts`
Cross-context communication ONLY via `chrome.runtime.sendMessage`.

### 3.4 Background service worker: no DOM access
The background service worker has no access to the DOM.
No `document`, `window`, `querySelector`, or any browser DOM API.
DOM interaction is exclusively the content script's job.

### 3.5 Popup: no network calls
The popup reads exclusively from `chrome.storage.local`.
Zero network calls (no `fetch`, no Axios) in any popup component.
If the popup needs fresh data from the backend, it gets it by reading
storage (which the background worker keeps up to date).

### 3.6 Alarms: always name them, never create duplicates

```ts
// ✅ CORRECT — create alarms only in onInstalled, not on every startup
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    chrome.alarms.clearAll(() => {
      chrome.alarms.create('budget-check',    { periodInMinutes: 5 });
      chrome.alarms.create('sync',            { periodInMinutes: 10 });
      chrome.alarms.create('cost-config',     { periodInMinutes: 1440 });
      chrome.alarms.create('session-cleanup', { periodInMinutes: 60 });
    });
  }
});

// ❌ WRONG — creating alarms on every service worker startup (causes duplicates)
chrome.alarms.create('budget-check', { periodInMinutes: 5 });  // at top level
```

### 3.7 MutationObserver: always disconnect before reconnecting

```ts
// ✅ CORRECT
let observer: MutationObserver | null = null;

function attachObserver(container: Element): void {
  if (observer) {
    observer.disconnect();   // always clean up first
    observer = null;
  }
  observer = new MutationObserver(handleMutation);
  observer.observe(container, { childList: true, subtree: true });
}

// ❌ WRONG — creating a new observer without disconnecting the old one
function attachObserver(container: Element): void {
  const observer = new MutationObserver(handleMutation);
  observer.observe(container, { childList: true, subtree: true });
}
```

### 3.8 waitForElement: always include a timeout

```ts
// ✅ CORRECT — with timeout fallback
async function waitForElement(selector: string, timeout = 10000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { observer.disconnect(); resolve(found); }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
  });
}

// If waitForElement returns null, log a warning and return — do not throw.
```

### 3.9 Never use eval() or innerHTML with dynamic content
CSP in Manifest V3 prohibits `eval()`.
Never use `element.innerHTML = userContent` — use `element.textContent` instead.

---

## 4. Website Rules

### 4.1 No inline styles
All styling goes through Tailwind utility classes.
Never write `style={{ color: 'red' }}` in JSX.
Exception: dynamically computed values that cannot be expressed as Tailwind
classes (e.g. `style={{ width: `${percentage}%` }}`).

### 4.2 Components are dumb by default
A component either fetches data OR renders data. Not both.
Data fetching goes in page-level components or context providers.
Shared UI primitives (`/components/ui/`) are always pure presentational.

```tsx
// ✅ CORRECT — dumb component, receives data as props
function BudgetWidget({ currentUSD, limitUSD, onEdit }: BudgetWidgetProps) {
  const percentage = (currentUSD / limitUSD) * 100;
  return ( ... );
}

// ❌ WRONG — component fetches its own data
function BudgetWidget() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.getSettings().then(setSettings); }, []);
  ...
}
```

### 4.3 Forms: no `<form>` tags, use button onClick
Browser extension webpages and artifact rendering environments may have
issues with native form submission. Use controlled inputs with button
`onClick` handlers.

```tsx
// ✅ CORRECT
const [email, setEmail] = useState('');
const handleSubmit = async () => { await authApi.requestOtp(email); };
return (
  <div>
    <Input value={email} onChange={e => setEmail(e.target.value)} />
    <Button onClick={handleSubmit}>Send Code</Button>
  </div>
);

// ❌ WRONG
return (
  <form onSubmit={handleSubmit}>
    <input name="email" />
    <button type="submit">Send Code</button>
  </form>
);
```

### 4.4 Loading states: always show a skeleton, never a blank screen
Every component that fetches data must have three states:
`loading` → Skeleton component, `error` → error message with retry,
`success` → actual content.

```tsx
// ✅ CORRECT
if (loading) return <Skeleton rows={4} />;
if (error)   return <ErrorMessage message={error} onRetry={refetch} />;
return <UsageChart data={usageData} />;

// ❌ WRONG
if (!usageData) return null;
return <UsageChart data={usageData} />;
```

### 4.5 API errors: always show user-facing messages, never raw errors

```tsx
// ✅ CORRECT
try {
  await authApi.requestOtp(email);
  navigate('/verify-otp');
} catch (err) {
  const message = axios.isAxiosError(err)
    ? err.response?.data?.error ?? 'Something went wrong. Please try again.'
    : 'Something went wrong. Please try again.';
  setError(message);
}

// ❌ WRONG
} catch (err) {
  setError(err.message);   // could expose internal error strings
}
```

### 4.6 Protected routes: use the established ProtectedRoute wrapper
Never write custom auth checks inside page components.
Always use the `<ProtectedRoute>` wrapper in `router.tsx`.

### 4.7 Environment variables: always prefixed with VITE_
Only env vars starting with `VITE_` are exposed to the browser bundle.
Never put secrets in website env vars.

### 4.8 Charts: use Recharts only, no Chart.js, no D3
`Recharts` is the approved chart library. Do not introduce Chart.js,
D3, Victory, or any other chart library. Recharts components to use:
`LineChart`, `BarChart`, `PieChart`, `ResponsiveContainer`, `Tooltip`,
`Legend`, `XAxis`, `YAxis`.

---

## 5. Backend Rules

### 5.1 Layered architecture is mandatory
Every request follows this path — no shortcuts:

```
Route → Rate Limiter(s) → Zod Validator → JWT Middleware → Controller → Service → Prisma
```

Controllers do not contain business logic.
Services do not contain HTTP logic (no `req`, `res`, `next`).
Prisma calls happen only in services (or a thin repository layer inside services).

### 5.2 Controllers are thin

```ts
// ✅ CORRECT — controller only calls service + formats response
export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body as z.infer<typeof requestOtpSchema>;
  const result = await authService.requestOtp(email);
  if (!result.success) return next(createError(400, result.error));
  res.json({ message: 'Verification code sent to your email.' });
}

// ❌ WRONG — business logic in controller
export async function requestOtp(req: Request, res: Response) {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  await prisma.otpRecord.create({ data: { email, otpHash: hash, expiresAt: ... } });
  await transporter.sendMail({ to: email, subject: '...', text: otp });
  res.json({ message: 'OTP sent' });
}
```

### 5.3 Services return Result types, not throw
Services communicate failure via the `Result<T>` discriminated union.
Only controllers (or the global error handler) throw/pass to `next()`.

```ts
// ✅ CORRECT
async function verifyOtpRecord(email: string, otp: string): Promise<Result<User>> {
  const record = await prisma.otpRecord.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } }
  });
  if (!record) return { success: false, error: 'Invalid or expired code.' };
  if (record.attempts >= 5) return { success: false, error: 'Too many attempts.' };
  ...
  return { success: true, data: user };
}
```

### 5.4 All request bodies are validated with Zod before the controller runs
Validation middleware runs before the controller.
Controllers can safely assume `req.body` matches the schema.

```ts
// In routes/auth.ts
router.post(
  '/request-otp',
  otpIpLimiter,
  otpEmailLimiter,
  validate(requestOtpSchema),  // ← middleware runs first, returns 400 on invalid body
  authController.requestOtp    // ← only reached if body is valid
);
```

### 5.5 Prisma: always use transactions for multi-step writes

```ts
// ✅ CORRECT — atomic: OTP marked used + user upserted together
const [_, user] = await prisma.$transaction([
  prisma.otpRecord.update({ where: { id: record.id }, data: { used: true } }),
  prisma.user.upsert({ where: { email }, create: { email }, update: {} })
]);

// ❌ WRONG — two separate writes (first can succeed, second can fail)
await prisma.otpRecord.update({ where: { id: record.id }, data: { used: true } });
const user = await prisma.user.upsert({ ... });
```

### 5.6 Never return stack traces to the client
The global error handler in `middleware/errorHandler.ts` is the only place
that catches unhandled errors. It logs the full error server-side and returns
a sanitized message to the client.

```ts
// ✅ CORRECT error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);
  const status  = (err as any).statusCode ?? 500;
  const message = status === 500
    ? 'An unexpected error occurred. Please try again.'
    : err.message;
  res.status(status).json({ error: message });
});

// ❌ WRONG — leaking stack trace
res.status(500).json({ error: err.message, stack: err.stack });
```

### 5.7 Environment variables: always validate on startup

```ts
// src/config/env.ts — runs before app starts
const required = ['DATABASE_URL', 'JWT_SECRET', 'GMAIL_USER', 'GMAIL_APP_PASSWORD',
                  'FRONTEND_URL', 'EXTENSION_ID', 'REDIS_URL'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);   // fail fast — don't start the server with missing config
  }
}
```

### 5.8 Prisma client is a singleton

```ts
// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 5.9 Rate limiters are defined in one file
All rate limiter instances live in `middleware/rateLimiters.ts`.
Never define a rate limiter inline in a route file.

### 5.10 CORS origin is strict — no wildcards
Never use `origin: '*'` in the CORS config.
The allowed origins are exactly: the website domain and the extension origin.

---

## 6. Approved Libraries

These libraries are locked in. Do not suggest alternatives.

### Extension

| Purpose | Library |
|---|---|
| Tokenization | `js-tiktoken` |
| Cross-browser | `webextension-polyfill` |
| Build | `vite` + `vite-plugin-web-extension` |
| UI | `react` 18 |
| TypeScript | `typescript` 5 |

### Website

| Purpose | Library |
|---|---|
| Framework | `react` 18 + `vite` |
| Routing | `react-router-dom` v6 |
| Styling | `tailwindcss` v3 |
| HTTP client | `axios` |
| Charts | `recharts` |
| TypeScript | `typescript` 5 |

### Backend

| Purpose | Library |
|---|---|
| Framework | `express` 4 |
| ORM | `prisma` 5 |
| Validation | `zod` |
| Auth tokens | `jsonwebtoken` |
| Password hashing | `bcrypt` (not `bcryptjs`) |
| Email | `nodemailer` |
| Security headers | `helmet` |
| Rate limiting | `express-rate-limit` + `rate-limit-redis` |
| HTTP param pollution | `hpp` |
| Compression | `compression` |
| Request logging | `morgan` |
| Scheduler | `node-cron` |
| TypeScript | `typescript` 5 |
| Dev runtime | `ts-node` + `nodemon` |

---

## 7. Banned Libraries & Patterns

These are explicitly prohibited. If an AI suggests one of these, refuse it.

### Banned libraries

| Library | Reason | Use instead |
|---|---|---|
| `mongoose` / `sequelize` / `typeorm` | Not Prisma | `prisma` |
| `passport` / `passport-jwt` | Overkill for JWT auth | Custom `authenticateJWT` middleware |
| `lodash` | Not needed with modern JS | Native JS array/object methods |
| `moment.js` | Deprecated, huge bundle | Native `Intl`, `Date`, or `date-fns` if needed |
| `redux` / `zustand` / `jotai` | Overkill for this scope | React Context + hooks |
| `styled-components` / `emotion` | Conflicts with Tailwind | Tailwind CSS only |
| `chart.js` / `d3` / `victory` | Not the approved chart lib | `recharts` |
| `joi` | Not the approved validator | `zod` |
| `yup` | Not the approved validator | `zod` |
| `multer` | No file uploads in this project | N/A |
| `socket.io` | No real-time in v1 | N/A |
| `jsonwebtoken` + `passport` together | Use one auth system | `jsonwebtoken` only |
| `dotenv` (in TS projects) | Use `ts-node --env-file` or native dotenv in Node 20 | Built-in |
| `cors` wildcard `*` | Security violation | Explicit allowed origins only |
| `express-validator` | Not the approved validator | `zod` |
| `axios` in extension popup | Popup makes no network calls | `chrome.storage.local` only |
| `jQuery` | Obviously not | Native DOM / React |
| `uuid` package | Node 20 has `crypto.randomUUID()` built in | `crypto.randomUUID()` |

### Banned patterns

```ts
// ❌ any type
const data: any = response.data;

// ❌ Non-null assertion without a comment explaining why
const user = req.user!;

// ❌ console.log in production code (use structured logging or remove)
console.log('user logged in', userId);

// ❌ Hardcoded secrets anywhere in code
const secret = 'my-jwt-secret-123';

// ❌ Synchronous bcrypt (always use async)
const hash = bcrypt.hashSync(otp, 10);

// ❌ eval() — banned by extension CSP
eval(someCode);

// ❌ innerHTML with dynamic content — XSS risk
element.innerHTML = userText;

// ❌ Storing JWT in localStorage (website) — use httpOnly cookie
localStorage.setItem('jwt', token);

// ❌ Raw SQL strings with template literals — SQL injection risk
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
// Use: prisma.user.findUnique({ where: { email } })

// ❌ Catching errors and swallowing them silently
try {
  await something();
} catch (_) {}   // never do this

// ❌ Returning HTTP 200 for errors
res.status(200).json({ success: false, error: 'Not found' });
// Use proper HTTP status codes: 400, 401, 403, 404, 429, 500

// ❌ Nested ternaries
const label = a ? b ? 'x' : 'y' : 'z';
// Use if/else or early returns instead

// ❌ Default exports for utilities and services (only for React components)
export default authService;   // ❌
export { authService };       // ✅

// ❌ Mutating function arguments
function process(session: Session) {
  session.totalTokens += 100;   // ❌ mutating input
}
// Return a new object instead
```

---

## 8. Error Handling Rules

### 8.1 The three-layer error model

```
Layer 1 — Validation (Zod middleware)
  → Bad input → immediately return 400 with field-level errors
  → Never reaches the controller

Layer 2 — Business logic (Service layer)
  → Returns Result<T> discriminated union
  → { success: false, error: string } for expected failures
  → Never throws (except for unexpected DB failures, which bubble to Layer 3)

Layer 3 — Unexpected errors (Global error handler)
  → Catches anything that throws and wasn't caught above
  → Logs full error server-side
  → Returns generic 500 message to client
```

### 8.2 HTTP status codes — use the right one

| Situation | Status |
|---|---|
| Success | 200 |
| Resource created | 201 |
| Bad request / validation failed | 400 |
| Not authenticated (no/invalid JWT) | 401 |
| Authenticated but not allowed | 403 |
| Resource not found | 404 |
| Rate limit exceeded | 429 |
| Internal server error | 500 |

### 8.3 Extension error handling

```ts
// ✅ CORRECT — content script errors are caught and logged, never thrown
async function initScraper(config: PlatformConfig): Promise<void> {
  try {
    const container = await waitForElement(config.selectors.messageContainer);
    if (!container) {
      console.warn(`[AI Token Tracker] Could not find message container on ${config.id}`);
      return;   // graceful degradation — tracking paused for this platform
    }
    attachObserver(container, config);
  } catch (error) {
    console.error(`[AI Token Tracker] Scraper error on ${config.id}:`, error);
    // Do not rethrow — a crash in one platform's scraper must not affect others
  }
}
```

### 8.4 Async/await: always try/catch, never unhandled rejections

```ts
// ✅ CORRECT
const result = await someAsyncOperation().catch((err) => {
  console.error('Operation failed:', err);
  return null;
});
if (!result) return;

// OR
try {
  const result = await someAsyncOperation();
} catch (err) {
  // handle it
}

// ❌ WRONG — unhandled promise rejection
someAsyncOperation();   // floating promise
```

---

## 9. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `SessionPanel.tsx` |
| Hooks | camelCase, `use` prefix | `useStorage.ts` |
| Services | camelCase, `Service` suffix | `authService.ts` |
| Controllers | camelCase, `Controller` suffix | `authController.ts` |
| Middleware | camelCase | `authenticateJWT.ts` |
| Schemas | camelCase, `.schemas.ts` suffix | `auth.schemas.ts` |
| Utility files | camelCase | `storage.ts`, `time.ts` |
| Type definition files | camelCase | `types.ts`, `express.d.ts` |
| Config files | camelCase | `env.ts`, `prisma.ts` |

### Variables & Functions

```ts
// Variables: camelCase
const weeklyLimitUSD = 5.00;
const estimatedTokens = 142;

// Boolean variables: is/has/should prefix
const isLoading = true;
const hasJWT = !!jwt;
const shouldSync = prefs.syncEnabled && !!jwt;

// Constants: SCREAMING_SNAKE_CASE for truly fixed values
const MAX_TURNS_PER_SESSION = 500;
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const BUDGET_THRESHOLDS = [0.5, 0.8, 1.0] as const;

// Functions: verb + noun
function estimateTokens(text: string): number { ... }
function getBudget(): Promise<Budget> { ... }
function checkThresholds(): Promise<void> { ... }
function classifyTask(...): SuggestionResult { ... }
```

### Database & Storage Keys

```
Database columns:      snake_case       (Prisma maps to camelCase in TS)
chrome.storage keys:   colon-namespaced (session:tabId, day:2026-07-26)
Environment variables: SCREAMING_SNAKE  (JWT_SECRET, GMAIL_USER)
```

### React Components

```tsx
// Props interface always named [ComponentName]Props
interface BudgetBarProps {
  currentUSD: number;
  limitUSD:   number;
  className?: string;
}

function BudgetBar({ currentUSD, limitUSD, className }: BudgetBarProps) { ... }
export default BudgetBar;   // default export for React components only
```

---

## 10. Code Style Rules

### 10.1 Imports: order matters

```ts
// 1. Node built-ins
import crypto from 'node:crypto';

// 2. Third-party packages
import express from 'express';
import { z }   from 'zod';

// 3. Internal absolute imports (from project root)
import { prisma }      from '../config/prisma';
import { authService } from '../services/authService';

// 4. Relative imports
import type { Result } from './types';

// blank line between each group
```

### 10.2 No magic numbers — use named constants

```ts
// ✅ CORRECT
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS   = 5;
const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

// ❌ WRONG
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);   // what is 5?
```

### 10.3 Early returns over nested if/else

```ts
// ✅ CORRECT
async function handleNewMessage(payload: NewMessagePayload): Promise<void> {
  if (!payload.text.trim()) return;
  const session = await getSession(payload.tabId);
  if (!session) return;
  const tokens = estimateTokens(payload.text);
  if (tokens === 0) return;
  await writeSessionTurn(session, payload, tokens);
}

// ❌ WRONG — pyramid of doom
async function handleNewMessage(payload: NewMessagePayload): Promise<void> {
  if (payload.text.trim()) {
    const session = await getSession(payload.tabId);
    if (session) {
      const tokens = estimateTokens(payload.text);
      if (tokens > 0) {
        await writeSessionTurn(session, payload, tokens);
      }
    }
  }
}
```

### 10.4 Object spread for updates, never mutate

```ts
// ✅ CORRECT
const updatedBudget: Budget = {
  ...budget,
  currentWeekUSD: budget.currentWeekUSD + costUSD,
  notified80: true
};
await setBudget(updatedBudget);

// ❌ WRONG
budget.currentWeekUSD += costUSD;   // mutation
budget.notified80 = true;
await setBudget(budget);
```

### 10.5 Comments: explain WHY not WHAT

```ts
// ✅ CORRECT — explains a non-obvious decision
// We cap turns at 500 to stay within chrome.storage.local's 5MB quota.
// Beyond 500, older turns are aggregated into a single summary entry.
const MAX_TURNS = 500;

// ✅ CORRECT — explains a workaround
// Gmail SMTP rejects connections when NODE_ENV=test, so we skip actual
// sending in test environments and just log the OTP instead.
if (process.env.NODE_ENV === 'test') {
  console.log(`[TEST] OTP for ${email}: ${otp}`);
  return;
}

// ❌ WRONG — just repeating what the code does
// Increment attempts
record.attempts += 1;
```

---

## 11. Security Rules (Non-negotiable)

These rules are never relaxed, even for "convenience" during development.

```
SEC-01  JWT_SECRET must be ≥ 256 bits (32 bytes hex). Generate with: openssl rand -hex 32
        Never use a short, memorable, or hardcoded secret.

SEC-02  OTPs are hashed with bcrypt (cost 10) before being stored.
        The raw OTP is never written to the database, never logged, never returned in an API response.

SEC-03  JWT stored as httpOnly cookie on the website (never in localStorage).
        JWT stored in chrome.storage.local on the extension (not in any web-accessible location).

SEC-04  All SQL goes through Prisma typed methods. No raw SQL template literals that
        include user input. If raw SQL is unavoidable, use Prisma.$queryRaw with tagged
        template literals (Prisma sanitizes these automatically).

SEC-05  Rate limiters are active in all environments including local development.
        Never comment out or bypass rate limiters for testing convenience.
        Use a separate test email or reset Redis keys for testing.

SEC-06  CORS origin list is explicit. Never use origin: '*' or origin: true.

SEC-07  Content scripts never send raw message text to the backend.
        Only token counts and metadata (platform, model, role, timestamp) are synced.

SEC-08  Environment variables are validated at startup (see backend Rule 5.7).
        If any required variable is missing, the server exits immediately.

SEC-09  Error responses never include stack traces, file paths, database error messages,
        or any internal implementation detail.

SEC-10  extension manifest.json declares only the minimum permissions needed.
        Do not add 'webRequest', 'history', 'bookmarks', '<all_urls>',
        or any permission not listed in architecture.md Section 5.1.
```

---

## 12. Git Rules

```
Branch naming:
  feature/short-description     → new feature
  fix/short-description         → bug fix
  chore/short-description       → tooling, deps, config

Commit message format:
  <type>(<scope>): <short description>

  Types:   feat | fix | chore | refactor | test | docs | style
  Scopes:  extension | website | backend | config | shared

  Examples:
    feat(extension): add context-length warning banner at 6k tokens
    fix(backend): correctly reset OTP attempts counter on new OTP request
    chore(deps): update prisma to 5.16.0
    docs: update architecture.md with sync flow diagram

Never commit:
  .env files
  node_modules/
  dist/ or build/
  *.zip (extension builds)
  Any file containing a real secret, API key, or password

.gitignore must include (per component):
  .env
  .env.local
  node_modules/
  dist/
  build/
  *.zip
  .DS_Store
```

---

## 13. AI Behavior Rules

These rules govern what the AI coding assistant is and is not allowed to do
without explicit permission during a vibe coding session.

### The AI MUST do:
- Read `prd.md` and `architecture.md` before writing any new file
- Follow the approved library list (Section 6) exactly
- Use the established folder structure and file names
- Add TypeScript types to every function parameter and return value
- Handle error cases explicitly (no silent swallowing)
- Write the complete file, not a partial with `// ...` placeholders
- Ask before adding any library not on the approved list
- Ask before changing any established function name, file name, or API path
- Implement exactly what was asked, no more

### The AI MUST NOT do:
- Suggest "better" alternatives to approved libraries
- Add features that weren't asked for
- Rename things from the architecture without asking
- Generate placeholder/mock data in production code
- Use `any` type
- Write partial files with `// TODO` or `// ... rest of implementation`
- Generate code that calls unapproved external APIs or third-party services
- Add `console.log` statements to production code (except `console.error` in catch blocks)
- Change the HTTP status codes defined in these rules
- Bypass or weaken any security rule
- Use synchronous versions of async functions (e.g. `bcrypt.hashSync`)
- Generate code that stores sensitive data in localStorage or sessionStorage on the website
- Add dependencies to `package.json` without being asked

### The AI SHOULD ask before:
- Writing a file that touches more than one component (cross-component changes)
- Adding a new npm package
- Changing a Prisma schema (migration is required after)
- Modifying the manifest.json permissions list
- Changing a rate limit value
- Adding a new API endpoint not in the architecture
- Changing a database schema column name (breaking change for sync)

### The AI prompt format expected per session:
```
Component: [extension | website | backend]
File to generate: [path/to/file.ts]
What it should do: [brief description]
Imports it will need: [list key imports]
```

---

## 14. Quick Reference Cheatsheet

```
Token tracking pipeline:
  content script → sendMessage → background worker → tokenize → storage

Auth pipeline:
  popup → open /login tab → website → POST /auth/verify-otp → backend
  → JWT → sendMessage to extension → store in chrome.storage.local

Sync pipeline:
  chrome.alarms (10min) → syncManager → POST /api/sync → backend → PostgreSQL

Budget check pipeline:
  chrome.alarms (5min) → budgetManager → read storage → fire notification

Cost config pipeline:
  chrome.alarms (daily) → fetch GitHub raw JSON → cache in storage → popup reads it

Suggestion pipeline:
  background worker receives user message → classifyTask() → store in session
  → popup reads session.lastSuggestion → renders SuggestionChip

File a question belongs in:
  "Where do I put X?"
  Business logic       → services/
  HTTP stuff           → controllers/ + routes/
  Validation schemas   → schemas/
  DB queries           → services/ (via prisma)
  Types/interfaces     → types.ts (shared) or component-local
  Constants/thresholds → utils/constants.ts
  Chrome storage ops   → utils/storage.ts
  Platform selectors   → content/platforms/config.ts
  Alarm handlers       → background/index.ts (router) + relevant module
```

---

*End of rules.md — AI Token Tracker*  
*Companion docs: prd.md · architecture.md*