/**
 * Factory for the app-wide QueryClient (see components/query-provider.tsx).
 */
import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/http"

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < 2
}

/**
 * Default client options tuned to reduce unnecessary refetches (landing + public lists).
 * Override per-query with queryOptions (e.g. longer staleTime for categories).
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 45_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
    },
  })
}
