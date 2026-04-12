import { fetchJson } from "@/lib/api/http"
import {
  parsePublicEventDetail,
  type PublicEventDetail,
} from "@/lib/api/event-detail-schema"

export async function fetchPublicEventDetail(
  id: string,
  options?: { accessToken?: string | null; signal?: AbortSignal },
): Promise<PublicEventDetail> {
  const headers: Record<string, string> = {}
  if (options?.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`
  }

  const raw = await fetchJson<unknown>(`/events/${encodeURIComponent(id)}`, {
    headers,
    signal: options?.signal,
    cache: "no-store",
  })

  return parsePublicEventDetail(raw)
}
