# FinCent — Implementation Plan

> Status: Implementation plan v0.1
> Purpose: Turn the [product foundation](./0-fincent-product-foundation.md)
> (P0/P1/P2 scope, UC-01 → UC-11) into a phased, buildable engineering plan.

## How to read this plan

- Phases are ordered by **dependency and value**, not by app layer. Each phase
  ships a usable slice (backend module + API + frontend screens) and ends with
  explicit **exit criteria**.
- Every backend module follows the existing DDD/CQRS layout
  (`domain` / `application` / `infrastructure` / `presentation`) as in
  `apps/be/src/modules/user`.
- Every frontend page replaces a placeholder under `apps/fe/app/(admin)/…`
  using `@repo/ui` components, Zod-validated forms, and typed API clients.
- Shared contracts (DTO types, enums, currency/date utils) live in
  `packages/shared` so FE and BE never drift.
- AI trust rules apply everywhere: **deterministic first, AI explains, user
  confirms, traceable, correctable**.

### Current state (baseline)

| Area                                                            | Status         |
| --------------------------------------------------------------- | -------------- |
| Monorepo, tooling, Docker (Postgres, Redis), CI conventions     | ✅ Done        |
| Auth: Clerk sign-in (FE), Clerk webhooks + `user` module (BE)   | ✅ Done        |
| Admin shell: sidebar, header, theming, placeholder pages        | ✅ Done        |
| Everything else (accounts, transactions, budgets, goals, AI, …) | ⬜ Not started |

### Phase overview

| Phase | Name                                                     | Scope tag | Delivers              |
| ----- | -------------------------------------------------------- | --------- | --------------------- |
| 1     | Financial core: accounts, categories, transactions       | P0        | UC-02 (partial UC-01) |
| 2     | Dashboard & cash-flow overview                           | P0        | UC-04                 |
| 3     | Recurring transactions, bills & reminders                | P0        | UC-06                 |
| 4     | Budgets                                                  | P0        | UC-05                 |
| 5     | Savings goal & Safe-to-Spend                             | P0        | UC-07, §9 formula     |
| 6     | Onboarding flow                                          | P0        | UC-01 (complete)      |
| 7     | AI capture: natural-language transaction entry           | P0        | UC-03                 |
| 8     | Basic AI insights + data privacy (export & deletion)     | P0        | UC-09 (basic), UC-11  |
| 9     | AI Q&A assistant                                         | P1        | UC-08                 |
| 10    | Multiple goals, anomaly detection, reports, import       | P1        | UC-07/09/10 extended  |
| 11    | Scale-out: bank sync, shared finances, debt, forecasting | P2        | Post-MVP segments     |

Phases 1–8 together constitute the **MVP (P0)**. Within a phase, backend and
frontend tracks can proceed in parallel once the API contract is agreed.

---

## Phase 1 — Financial core: accounts, categories, transactions (P0)

The deterministic foundation everything else computes from. Nothing
AI-related ships in this phase.

### Data model (Prisma)

- `Account` — id, userId, name, type (`CASH | BANK | E_WALLET | CREDIT_CARD | OTHER`),
  currency, openingBalance, currentBalance (derived, cached), archivedAt.
- `Category` — id, userId (null = system default), name, icon, type
  (`INCOME | EXPENSE`), parentId (optional group), isArchived.
- `Transaction` — id, userId, accountId, categoryId, type
  (`INCOME | EXPENSE | TRANSFER`), amount, currency, occurredAt, note,
  source (`MANUAL | AI_DRAFT | RECURRING | IMPORT`), counterAccountId (for
  transfers), createdAt/updatedAt, deletedAt (soft delete).
- Seed script for default categories (localized names).

### Backend (`modules/account`, `modules/category`, `modules/transaction`)

- CRUD commands/queries per module; repository interfaces + Prisma repos.
- Balance engine in `transaction` domain: creating/updating/deleting a
  transaction adjusts account balances **transactionally** (single source of
  truth; never trust client-sent balances).
- Transfer = paired movement between two accounts, never counted as
  income/expense in reports.
- List endpoint with cursor pagination + filters (date range, account,
  category, type, text search) — this powers every later report.
- Domain events (`TransactionCreated/Updated/Deleted`) emitted for later
  phases (budgets, goals, insights) to subscribe to.
- Swagger-documented DTOs; class-validator on every input.

### Frontend

- `(admin)/accounts` — account list with balances, create/edit/archive
  dialogs, per-account transaction drill-down.
- `(admin)/transactions` — filterable, paginated table; quick-add form
  (amount → category → account → date, ≤ 3 interactions for the common case);
  edit/delete/duplicate actions; transfer entry.
- Category management (inside settings or a dialog): custom categories,
  archive, re-parent.
- Shared money/date formatting utils in `packages/shared` (decimal-safe:
  amounts stored as integer minor units, formatted per currency).

### Exit criteria

- A user can create accounts, record income/expense/transfer, edit and delete
  them, and account balances always reconcile with the transaction log.
- Deleting/editing a historical transaction correctly recomputes balances.
- API covered by integration tests for the balance engine edge cases.

---

## Phase 2 — Dashboard & cash-flow overview (P0)

Answers **“Now”** — where is my money and what have I spent it on? (UC-04)

### Backend (`modules/overview` or query layer in existing modules)

- Aggregate queries (read-side, cacheable in Redis, invalidated by
  transaction events): total balance by account; income/expense/net for the
  current period; top categories; daily spend series for the period.
- Period logic: calendar month first, designed so a configurable payday cycle
  can replace it later (decision §14.3) — one `PeriodResolver` abstraction.

### Frontend

- `(admin)/dashboard` — decision-first layout, in priority order:
  1. total balance + per-account breakdown;
  2. income / expenses / net cash flow for the period;
  3. Safe-to-Spend placeholder card (wired for real data in Phase 5);
  4. upcoming bills (wired in Phase 3);
  5. budgets at risk (wired in Phase 4);
  6. goal progress (wired in Phase 5);
  7. recent transactions + quick-add entry point.
- Charts follow the shared dataviz conventions; every number links to the
  filtered transaction list that produced it (**traceable**).

### Exit criteria

- Dashboard numbers match the transaction ledger exactly for seeded fixtures.
- Cached aggregates invalidate within one request of a transaction change.

---

## Phase 3 — Recurring transactions, bills & reminders (P0)

Answers part of **“Next”** — what obligations are coming? (UC-06)

### Data model

- `RecurringRule` — userId, accountId, categoryId, type, amount, cadence
  (RRULE-style: monthly/weekly/custom), nextDueAt, autoConfirm (default
  false), endsAt, isPaused.
- `RecurringOccurrence` — ruleId, dueAt, status
  (`PROJECTED | DUE | CONFIRMED | SKIPPED`), transactionId (once confirmed).

### Backend (`modules/recurring`)

- Scheduler (NestJS cron) materializes occurrences ahead of time and flips
  `PROJECTED → DUE`; confirming an occurrence creates a real transaction via
  the Phase 1 command (source = `RECURRING`).
- Projected occurrences feed cash-flow projection and (later) Safe-to-Spend.
- Reminder engine v1: in-app notification list + badge; email/push deferred
  to Phase 10. Warn when projected balance can't cover an upcoming bill.

### Frontend

- `(admin)/recurring` — rule list with next-due dates, create/edit/pause,
  and a due-now inbox (confirm / adjust amount / skip).
- Dashboard "upcoming bills" card goes live.

### Exit criteria

- A monthly bill created today appears in projections, produces a DUE
  occurrence on schedule, and confirming it writes a normal transaction.
- No occurrence is ever auto-confirmed without the user's opt-in.

---

## Phase 4 — Budgets (P0)

Turns tracking into control. (UC-05)

### Data model

- `Budget` — userId, categoryId (or category group), amount, period type,
  startDate, rollover (bool, default false), isArchived.

### Backend (`modules/budget`)

- Spent/remaining computed from transactions (deterministic, never stored
  ahead of the ledger); pace = spent ÷ elapsed period fraction.
- Overrun forecast: linear pace projection v1 (`projected = pace × period`),
  clearly labeled as an estimate; threshold events at 80% and 100%.
- Budget status feeds dashboard "budgets at risk" card and notifications.

### Frontend

- `(admin)/budgets` — budget list with progress bars (spent, remaining,
  pace), risk badges, create/edit dialogs, and per-budget drill-down into
  the underlying transactions.
- Warning surface: "at this pace you'll exceed Food by ~X on the 24th; keep
  daily spend under Y to stay within budget."

### Exit criteria

- Budget math matches the ledger for fixtures including edits/deletes of
  historical transactions.
- A budget crossing 80% produces exactly one warning per period.

---

## Phase 5 — Savings goal & Safe-to-Spend (P0)

The product's core differentiator: answers **“Next”** and **“Action”**.
(UC-07 + §9 formula)

### Data model

- `Goal` — userId, name, targetAmount, deadline, priority, status,
  linkedAccountId (optional earmarked account).
- `GoalContribution` — goalId, amount, occurredAt, transactionId (optional).
- `SafeToSpendSnapshot` — userId, computedAt, amount, breakdown (JSON), for
  history/audit ("traceable").

### Backend (`modules/goal`, `modules/safe-to-spend`)

- Goal plan proposal: required contribution = remaining ÷ periods left,
  checked against available cash flow; recalculates on transaction/bill
  changes; behind-schedule options (raise contribution / extend deadline /
  reduce target) computed deterministically.
- Safe-to-Spend service implementing §9 exactly:

  ```text
  STS = available balance
      + confirmed remaining income this period
      - remaining bills & essential expenses (Phase 3 projections)
      - committed goal contributions
      - safety buffer (user-configurable, sensible default)
  ```

- Response always includes: period, line-item breakdown, income confidence,
  incomplete-data warnings. Cached in Redis, invalidated by
  transaction/recurring/goal events.
- MVP treats credit cards conservatively (exclude credit limits from
  available balance; card payments count as bills) — revisit in Phase 11.

### Frontend

- `(admin)/goals` — one active goal (MVP), progress, contribution history,
  plan chooser, behind-schedule options.
- Safe-to-Spend hero card on dashboard with expandable "how was this
  calculated?" breakdown — every line links to its source data.
- `(admin)/scenarios` v1 — simple simulation: "if I spend X today, STS and
  goal date become …" (pure deterministic recompute, no AI).

### Exit criteria

- STS reproduces hand-calculated values for fixture scenarios (with/without
  pending bills, low balance, goal committed).
- Every STS display can be expanded to its full breakdown.

---

## Phase 6 — Onboarding flow (P0)

With accounts, recurring, and goals built, UC-01 can now be assembled
end-to-end. First-run experience: register → add accounts & balances →
recurring income/expenses → one goal → see overview + first Safe-to-Spend.

### Work

- FE wizard (post-sign-up route): currency + cycle start, add accounts with
  opening balances, add income source + key recurring expenses, set one goal
  — every step skippable, progress saved server-side
  (`User.onboardingState`).
- Completion screen: initial overview + STS + "what's still missing" hints
  (reuses Phase 2/5 components).
- Empty states across all pages that route users back to missing setup steps.

### Exit criteria

- A brand-new user reaches a meaningful dashboard with an STS number in
  under 5 minutes without touching settings.
- Onboarding completion rate is measurable (analytics event per step).

---

## Phase 7 — AI capture: natural-language transaction entry (P0)

First AI feature — only after the deterministic core is trustworthy. (UC-03)

### Backend (`modules/ai-capture`)

- LLM extraction endpoint: free text → structured draft {type, amount,
  currency, occurredAt, account?, category?, note} with per-field confidence.
  Provider behind an interface (`LlmProvider`) so models are swappable;
  send only the minimal prompt context (category/account names — **data
  minimization**, never the full ledger).
- Draft lifecycle: `TransactionDraft` stored with status
  (`PENDING | CONFIRMED | DISCARDED`); confirming creates a transaction
  (source = `AI_DRAFT`) via the Phase 1 command.
- Missing/ambiguous fields (no amount, unknown account) → the draft marks
  them as required questions; the system **asks, never guesses**.
- `CategoryCorrection` log: user's fixes recorded and fed back as few-shot
  context for that user's future extractions ("correctable").

### Frontend

- Global quick-capture input (header/command-palette style, keyboard-first):
  type "Lunch 65k cash today" → preview card with editable fields and
  confidence hints → confirm/correct/discard.
- Mobile-friendly single-screen flow; corrections take ≤ 2 taps.

### Exit criteria

- Well-formed inputs produce correct drafts; malformed inputs produce
  questions, not fabricated values.
- Nothing is ever saved to the ledger without explicit confirmation.
- % of drafts confirmed without correction is tracked (north-star input).

---

## Phase 8 — Basic AI insights + data privacy (P0 completion)

Finishes MVP scope: basic insights (UC-09 basic slice) and user data control
(UC-11).

### Insights (`modules/insight`)

- Deterministic detectors first (no LLM required to _find_ facts):
  large-vs-typical expense, category growth vs previous period, possible
  duplicate transaction, recurring bill amount change.
- Each detector emits an `Insight` {type, severity, evidence: transaction
  ids + figures, period}. LLM used only to phrase the explanation from the
  evidence payload. Max 3 insights surfaced on the dashboard, dismissible;
  flags only — never auto-modifies data.

### Data privacy (`modules/privacy` + `(admin)/data-privacy` page)

- Export all transactions/accounts/budgets/goals as CSV + JSON (async job,
  download link).
- AI data-usage toggle: when off, Phase 7/8 LLM features disable cleanly.
- Account deletion: Clerk deletion webhook already handled — extend to full
  cascade + grace period; audit log of important changes (balance edits,
  deletions, exports).

### Exit criteria

- **MVP complete:** all P0 items in §8 of the product foundation shippable.
- Export produces a re-importable, complete dataset; deletion leaves no
  orphaned rows.
- With AI consent off, zero requests leave for the LLM provider.

> **Milestone: MVP launch / validation window.** Run the §13 validation
> (interviews, prototype tasks, concierge insights) before investing in P1.

---

## Phase 9 — AI Q&A assistant (P1)

UC-08: answer questions from the user's own data.

- Tool-based architecture: the LLM can only call read-only, user-scoped
  query tools (spending by category/period, STS, goal math, transaction
  search) — it never receives the raw ledger wholesale and never computes
  numbers itself.
- Response contract enforced server-side: direct answer → figures &
  assumptions → linked evidence → one recommended action → estimate/data
  warnings.
- FE: assistant panel (side sheet available on every page) with cited,
  clickable evidence; suggested starter questions.
- Affordability questions ("can I buy a $700 phone in October?") reuse the
  Phase 5 scenario engine — AI narrates, the engine computes.

## Phase 10 — P1 breadth: goals, anomalies, reports, import, notifications

Parallelizable work streams once Phase 9 stabilizes:

1. **Multiple goals** — priorities, contribution allocation recommendations,
   conflict warnings (goal vs budget vs STS).
2. **Advanced anomaly detection** — statistical baselines per user
   (seasonality, payday effects), balance-reconciliation prompts.
3. **Periodic reports** (UC-10) — weekly/monthly generated summaries: totals,
   notable changes, budget outcomes, goal progress, ≤ 3 priority actions;
   delivered in-app first.
4. **Import** — CSV mapping wizard (bank-statement presets), receipt-image
   extraction reusing the Phase 7 draft/confirm pipeline; duplicate
   detection against existing ledger.
5. **Multichannel notifications** — email/push providers behind the Phase 3
   reminder engine; per-type frequency caps and quiet hours (risk table:
   "too many alerts").

## Phase 11 — P2 scale-out (post-MVP, sequenced by demand)

Each is a separate project with its own design doc; listed for roadmap
completeness:

- direct bank & e-wallet synchronization (aggregator integration, dedup
  against manual entries);
- family/shared accounts — shared wallets, budgets, roles & permissions;
- debt management — schedules, interest, payoff strategies (snowball /
  avalanche), STS integration for credit;
- investment portfolio tracking with market values;
- long-term cash-flow forecasting (12-month projection with confidence
  bands);
- payment/transfer automation (only with explicit per-action authorization —
  see "AI should not" boundaries).

---

## Cross-cutting workstreams (run through every phase)

| Workstream       | Practice                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Testing          | Unit tests for domain logic (balance engine, STS, budget math are the crown jewels); integration tests per module API; a small E2E smoke for the daily-use journey (enter → confirm → metrics update). |
| Security         | User-scoped authorization on every query (no cross-tenant leakage), input validation everywhere, audit log (Phase 8), data minimization to LLM providers, secrets via validated env.                   |
| Performance      | Redis caching for aggregates with event-driven invalidation; cursor pagination; indexes on (userId, occurredAt), (userId, categoryId).                                                                 |
| Observability    | Structured logs with request context (exists), error filter (exists), metric events for the §11 success metrics from Phase 2 onward.                                                                   |
| Shared contracts | Every new API lands its types/enums in `packages/shared` in the same PR.                                                                                                                               |
| Docs             | Each phase updates Swagger + a short module README; ADRs for the §14 product decisions as they get made.                                                                                               |

## Open product decisions that gate specific phases

From §14 of the product foundation — decide before the phase that needs it:

| Decision                                    | Gates                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Single currency (VND) vs multi-currency     | Phase 1 data model (recommend: store currency per account from day one, support one display currency in MVP) |
| Calendar month vs configurable payday cycle | Phase 2 `PeriodResolver` (recommend: calendar month MVP, abstraction ready)                                  |
| Credit card / debt treatment in STS         | Phase 5 (recommend: conservative exclusion, revisit Phase 11)                                                |
| AI insights on demand vs periodic           | Phase 8 (recommend: periodic generation + on-demand refresh)                                                 |
| Data retention & LLM transmission policy    | Phase 7 (must be written before first LLM call ships)                                                        |
| Business model (free/freemium/subscription) | No engineering gate until P1; affects notification/report limits                                             |
