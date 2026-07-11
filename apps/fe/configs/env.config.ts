import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Centralized, validated environment access for the FinCent frontend.
 *
 * - `client`: inlined into the browser bundle at build time (must be prefixed
 *   with `NEXT_PUBLIC_`). Validated during `next build`.
 * - `server`: server-only secrets, never shipped to the client.
 * - Every var must also be listed in `runtimeEnv` so Next can statically inline
 *   the public ones.
 *
 * Import `Env` instead of reading `process.env` directly so missing/invalid
 * configuration fails fast with a clear error.
 */
export const Env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  // Docker builds pass NEXT_PUBLIC_* as build args; set SKIP_ENV_VALIDATION=true
  // in CI/build stages where server secrets are intentionally absent.
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  emptyStringAsUndefined: true,
});
