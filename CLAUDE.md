# FinCent — Agent Rules

Turborepo monorepo: `apps/fe` (Next.js 16 App Router, React 19, Tailwind v4),
`apps/be` (NestJS 11), shared packages in `packages/*` (`@repo/ui`, `@repo/shared`, …).

## Frontend

- **Prefer existing shadcn/ui components in `@repo/ui` over raw HTML.** Before
  writing a raw `<button>`, `<input>`, a card `<div>`, a divider, dropdown,
  dialog, tooltip, etc., check `packages/ui/src/components/` and import the
  matching component (e.g. `@repo/ui/components/button`, `.../card`,
  `.../separator`, `.../progress`). Only use raw elements for semantic text
  (headings, paragraphs, labels) or when no component exists. Extend a component
  via its `className` prop (merged with `cn`) instead of forking it.
- **Design system:** style with the TBH design language and tokens — see
  `.agents/skills/tbh-design-system`. Use theme-aware shadcn semantic tokens
  (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`,
  `bg-card`) for surfaces so light/dark both work; use TBH brand tokens
  (`font-display`, `font-mono`, accent gradient, `accent-*`) for brand accents.
- **Theme:** light + dark via `next-themes` (`@repo/ui/components/theme-provider`
  + `@repo/ui/components/mode-toggle`). **Default theme is dark.**
- **Env:** never read `process.env` directly in FE code. Import the validated
  `Env` from `@/configs/env.config` (`@t3-oss/env-nextjs` + `zod`).
- **Imports:** use path aliases (`@/*`, `@repo/ui/*`), never relative imports
  (enforced by eslint `no-restricted-imports`).
- **Responsive:** design mobile-first and verify every screen at ≤720px.

## Verify before done

- `pnpm lint:fix` and `pnpm build` must pass. Prefer running filtered:
  `pnpm build:fe` / `pnpm build:be`.
