# AI Token Tracker

> Track your AI token spend across 20+ platforms. Get smarter model suggestions.

AI Token Tracker is a privacy-first browser extension and web analytics platform that automatically measures token volume and estimated costs across ChatGPT, Claude, Gemini, DeepSeek, Grok, and 15+ AI web chat interfaces in real time.

---

## 🌟 Key Features

- ⚡ **20+ Supported AI Platforms**: ChatGPT, Claude, Gemini, Grok, DeepSeek, Mistral, HuggingChat, Poe, Qwen, Groq, You.com, Kimi, Pi, OpenRouter, Cohere, Character.AI, Bing, Copilot, Meta AI, Perplexity.
- 🔒 **Privacy-First Architecture**: Message text is tokenized in-memory inside your browser and discarded immediately. No raw prompt text is ever saved locally or sent to external servers.
- 📊 **Real-Time Token & Cost Analytics**: Accurate token estimation using `js-tiktoken` (`cl100k_base`) with live vendor pricing tables.
- 🔔 **Weekly Budget Alerts**: Custom weekly spending caps with browser notifications at 50%, 80%, and 100% budget thresholds.
- 💡 **Model Recommendation Engine**: Classifies prompt intent (Code, Quick Q&A, Long Context, Creative, Research) and suggests optimal models to maximize speed and minimize cost.
- 🌐 **Companion Web Dashboard**: Interactive analytics dashboard with Recharts charts, platform share breakdown, model efficiency tables, and session logs.

---

## 🏗 Repository Structure

```text
Fluxio/
├── extension/          # Manifest V3 browser extension (React + Vite + TypeScript)
├── website/            # Landing page, auth pages, and web dashboard (React + TailwindCSS + Recharts)
├── backend/            # Express.js API server & Prisma ORM (PostgreSQL + JWT + Nodemailer + Rate Limiters)
├── config/costs.json   # Remote pricing config fallback
└── Docs/               # PRD, Architecture, Rules, Design system & Implementation roadmap
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL database (or Supabase instance)

### 1. Extension Setup

```bash
cd extension
npm install
npm run build
```
Load the `extension/dist` directory as an unpacked extension in Chrome via `chrome://extensions`.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name initial
npm run dev
```

### 3. Website Setup

```bash
cd website
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:3000
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/token_tracker?schema=public"
JWT_SECRET="super-secret-random-32-char-key"
FRONTEND_URL="http://localhost:5173"
GMAIL_USER="yourapp@gmail.com"
GMAIL_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

### Website (`website/.env`)

```env
VITE_API_URL="http://localhost:3000"
```

---

## 📄 License & Contributing

Distributed under the MIT License. See [`LICENSE`](file:///D:/Projects/Fluxio%20Tockeniser/LICENSE) for more information.
To contribute new AI platform configs, refer to [`CONTRIBUTING.md`](file:///D:/Projects/Fluxio%20Tockeniser/CONTRIBUTING.md).