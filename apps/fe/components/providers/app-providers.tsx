'use client';

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { Env } from '@/configs/env.config';
import { FinCentApi } from '@/libs/api/fincent-api';
import { HttpClient } from '@/libs/api/http-client';

const ApiContext = createContext<FinCentApi | null>(null);

export function useApi(): FinCentApi {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within AppProviders');
  }
  return api;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const api = useMemo(
    () =>
      new FinCentApi(
        new HttpClient(Env.NEXT_PUBLIC_API_URL, {
          getToken: () => getToken(),
        }),
      ),
    [getToken],
  );

  return (
    <ApiContext.Provider value={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}
