import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const Env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).default('/sign-in'),
    // Where Clerk sends the browser back to finish the OAuth handshake.
    NEXT_PUBLIC_REDIRECT_URL: z
      .string()
      .min(1)
      .default('/sign-in/sso-callback'),
  },
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    CLERK_SECRET_KEY: z.string().min(1),
  },

  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },

  // NEXT_PUBLIC_* are inlined at build time; CLERK_SECRET_KEY is a runtime-only
  // secret that is intentionally absent during `next build` (the Docker build
  // only receives NEXT_PUBLIC_* as build args). Skip the eager check at build
  // time via SKIP_ENV_VALIDATION; the full schema — including CLERK_SECRET_KEY —
  // is still validated when the server boots/renders at runtime.
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  // Treat empty strings as missing so `FOO=` fails `.min(1)` instead of slipping
  // through as a valid empty value.
  emptyStringAsUndefined: true,
});
