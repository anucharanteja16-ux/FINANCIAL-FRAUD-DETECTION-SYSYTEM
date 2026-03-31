# FraudShield - Financial Fraud Detection System

## Overview

FraudShield is a full-stack web application that detects fake/fraudulent financial messages such as SMS, emails, WhatsApp payment messages, and phishing attempts. It classifies messages as **Safe**, **Spam**, or **Fraud** using a rule-based NLP engine with pattern matching, URL analysis, and fraud indicator detection.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend API**: Express 5 (TypeScript)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Charts**: Recharts
- **Routing**: Wouter

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server with fraud detection routes
│   │   └── src/
│   │       ├── lib/
│   │       │   └── fraudDetector.ts   # Core fraud detection engine
│   │       └── routes/
│   │           ├── analysis.ts        # POST/GET /api/analysis
│   │           └── stats.ts           # GET /api/stats/*
│   └── fraudshield/        # React + Vite frontend (serves at /)
│       └── src/
│           └── pages/
│               ├── dashboard.tsx      # Security overview with charts
│               ├── analyze.tsx        # Message analysis input + results
│               ├── history.tsx        # Past analyses table
│               └── roadmap.tsx        # Learning resource / architecture page
├── lib/
│   ├── api-spec/           # OpenAPI 3.1 spec
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/
│       └── src/schema/
│           └── analyses.ts # Drizzle table for stored analysis results
└── scripts/
```

## API Endpoints

- `GET /api/healthz` — Health check
- `POST /api/analysis` — Analyze a message (body: `{ message, channel }`)
- `GET /api/analysis` — Get analysis history (query: `?limit=&offset=`)
- `GET /api/analysis/:id` — Get specific analysis result
- `GET /api/stats/dashboard` — Aggregate stats (totals, rates, URLs checked)
- `GET /api/stats/recent` — 10 most recent analyses
- `GET /api/stats/breakdown` — Classification breakdown by channel and day

## Fraud Detection Engine

The `fraudDetector.ts` engine uses:
1. **Keyword matching** — 30+ fraud and spam keyword patterns
2. **Urgency detection** — Regex for time pressure language
3. **Credential request detection** — OTP, PIN, CVV, card/account number requests
4. **Money transfer detection** — Payment/transfer language
5. **Prize/lottery scam detection** — Winner/reward language
6. **URL extraction + analysis** — Checks for URL shorteners, IP addresses, typosquatting, suspicious TLDs, phishing keywords in URLs
7. **Risk scoring** — Weighted score (0-100) based on indicator severity
8. **Classification** — Safe / Spam / Fraud based on risk thresholds

## Pages

- `/` — Dashboard: stats cards, weekly trend chart, recent activity feed, classification breakdown pie chart
- `/analyze` — Analyze any message: input + channel selector, full result display with indicators, URL checks, risk gauge
- `/history` — Paginated table of all past analyses
- `/roadmap` — Learning resource: architecture diagrams, tech stack, development roadmap, AI/ML explanation

## TypeScript & Composite Projects

- `lib/*` packages are composite and emit declarations via `tsc --build`.
- Root `tsconfig.json` is a solution file for libs only.
- Run `pnpm run typecheck` from root for full check.

## Development

- `pnpm --filter @workspace/api-server run dev` — Start API server
- `pnpm --filter @workspace/fraudshield run dev` — Start frontend
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client hooks
- `pnpm --filter @workspace/db run push` — Push DB schema changes
