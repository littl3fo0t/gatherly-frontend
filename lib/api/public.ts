/**
 * Public API calls (no auth header). Used by the landing page and discovery UI.
 * Pair with React Query + queryKeys.public.* for caching.
 */
import { fetchJson } from "@/lib/api/http"
import type { ApiPage, PublicCategory, PublicEventListItem } from "@/lib/api/public-types"

export async function getPublicEvents(args?: { page?: number; size?: number }) {
  const page = args?.page ?? 0
  const size = args?.size ?? 25
  return await fetchJson<ApiPage<PublicEventListItem>>(`/events?page=${page}&size=${size}`, {
    cache: "no-store",
  })
}

export async function getPublicCategories() {
  return await fetchJson<PublicCategory[]>("/categories", { cache: "force-cache" })
}

