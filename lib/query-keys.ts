/**
 * Stable query keys for TanStack React Query.
 * Keeps cache keys consistent for useQuery, prefetchQuery, and invalidateQueries.
 */
const publicRoot = ["public"] as const

export const queryKeys = {
  public: {
    all: publicRoot,
    events: (page: number, size: number) =>
      [...publicRoot, "events", page, size] as const,
    categories: () => [...publicRoot, "categories"] as const,
  },
} as const
