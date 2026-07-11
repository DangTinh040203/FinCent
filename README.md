# FinCent

**FinCent** is an AI-powered personal finance assistant that turns everyday
transactions into an actionable financial plan. Instead of being just another
expense ledger, it answers the three questions people actually care about:

1. **Now** — Where is my money, and what have I spent it on?
2. **Next** — How much can I safely spend between now and my next paycheck?
3. **Action** — What should I do to reach my goals without cutting essentials?

The core idea is **Safe-to-Spend**: a continuously updated, transparent estimate
of how much a user can spend after accounting for bills, essentials, and goal
contributions. AI sits on top as an interaction and explanation layer — it
extracts transactions from natural language, explains cash flow, and recommends
actions — but every number is computed deterministically and every AI suggestion
is confirmed by the user.

> Detailed product thinking lives in [`docs/`](./docs):
> [product foundation](./docs/0-fincent-product-foundation.md),
> [competitive analysis](./docs/1-fincent-competitive-analysis.md), and
> [use-case diagrams](./docs/2-fincent-use-case-diagram.md).

## What it does

- **Capture fast** — record income/expenses in seconds, including natural
  language ("Lunch 65k cash today") with a confirm-before-save preview.
- **Understand clearly** — plain-language cash-flow summaries, anomaly detection,
  and explanations traceable back to the underlying transactions.
- **Act confidently** — Safe-to-Spend, budget-overrun warnings, savings-goal
  plans, recurring bills & reminders, and periodic reviews.

See the [MVP scope](./docs/0-fincent-product-foundation.md#8-proposed-mvp-scope)
for the full P0/P1/P2 breakdown.

## Tech stack

| Area       | Tech                                                       |
| ---------- | ---------------------------------------------------------- |
| Monorepo   | Turborepo, pnpm workspaces                                 |
| Frontend   | Next.js 16 (App Router), React 19, Tailwind CSS v4         |
| UI         | shadcn/ui-style shared component library, light/dark theme |
| Backend    | NestJS 11 (DDD + CQRS layering), Swagger, event-driven     |
| Auth       | Clerk (`@clerk/nextjs` + `@clerk/backend`), Svix webhooks  |
| Database   | PostgreSQL via Prisma 7                                    |
| Caching    | Redis (cache-manager + Keyv)                               |
| Validation | class-validator / Joi (BE), Zod + `@t3-oss/env` (FE)       |
| Language   | TypeScript (strict)                                        |
| Tooling    | ESLint 9 (flat config, shared), Prettier (shared), Docker  |

## Structure

```
apps/
  fe/                  # Next.js frontend (port 3001)
  be/                  # NestJS backend  (port 8000)
packages/
  ui/                  # Shared React UI components (shadcn/ui style)
  shared/              # Shared types & utils (FE + BE)
  eslint-config/       # Shared ESLint flat configs (base / next-js / react-internal / node)
  prettier-config/     # Shared Prettier config
  typescript-config/   # Shared tsconfig presets (base / nextjs / nestjs / react-library)
docker/                # Dockerfiles + compose (dev / prod)
docs/                  # Product foundation, competitive analysis, use cases
```

The backend follows a **domain-driven, CQRS-style layout** per module —
`domain`, `application`, `infrastructure`, `presentation` — so business rules
stay independent of the framework and transport layer.

## Getting started

```bash
# Requirements: Node >= 20, pnpm >= 9
pnpm install

# Copy env files and fill in Clerk keys, database URL, Redis URL, etc.
cp apps/fe/.env.example apps/fe/.env
cp apps/be/.env.example apps/be/.env

# Start Postgres + Redis for local dev
pnpm docker:dev

# Apply the database schema
pnpm --filter @repo/be db:migrate

# Run both apps in dev mode
pnpm dev

# Or individually
pnpm dev:fe   # http://localhost:3001
pnpm dev:be   # http://localhost:8000/api  (Swagger UI at /docs)
```

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Run FE + BE in parallel (dev mode)  |
| `pnpm build`      | Build all apps & packages           |
| `pnpm lint`       | Lint all workspaces                 |
| `pnpm lint:fix`   | Lint & auto-fix                     |
| `pnpm typecheck`  | Typecheck all workspaces            |
| `pnpm test`       | Run tests                           |
| `pnpm format`     | Format the whole repo with Prettier |
| `pnpm docker:dev` | Start local infra (Postgres, Redis) |

Database helpers (run inside `apps/be`, e.g. `pnpm --filter @repo/be db:studio`):
`db:generate`, `db:push`, `db:migrate`, `db:migrate:deploy`, `db:studio`.

## Conventions

- **Path aliases only** — relative imports are blocked by ESLint; use `@/*` inside apps and `@repo/*` across packages.
- **Import boundaries** — FE must not import from BE (and vice versa); shared code lives in `packages/shared`.
- **Import sorting** — enforced via `eslint-plugin-simple-import-sort`.
- **Prettier** — single quotes, semicolons, trailing commas, 80 print width (see `packages/prettier-config`).

## AI principles

FinCent treats AI as an assistant, not the source of truth:

- **Deterministic first** — balances, totals, budgets, and goal progress are computed by system logic.
- **AI explains** — it interprets calculated results and source-backed data.
- **User confirms** — any AI-inferred data stays a suggestion until the user approves it.
- **Traceable** — answers show the time range, accounts, and transactions used.
- **Correctable** — users can always correct results, and feedback improves future suggestions.
