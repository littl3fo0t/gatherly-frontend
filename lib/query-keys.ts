/**
 * Stable query keys for TanStack React Query.
 * Keeps cache keys consistent for useQuery, prefetchQuery, and invalidateQueries.
 */
const publicRoot = ["public"] as const
const profileRoot = ["profile"] as const

export const queryKeys = {
  public: {
    all: publicRoot,
    events: (page: number, size: number) =>
      [...publicRoot, "events", page, size] as const,
    eventDetail: (id: string, authenticated: boolean) =>
      [...publicRoot, "event", id, authenticated ? "auth" : "anon"] as const,
    categories: () => [...publicRoot, "categories"] as const,
  },
  profile: {
    all: profileRoot,
    me: () => [...profileRoot, "me"] as const,
  },
} as const
