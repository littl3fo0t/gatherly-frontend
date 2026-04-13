import { fetchJson } from "@/lib/api/http"
import type { EventCreateApiBody, EventUpdateApiBody } from "@/lib/event-form-schema"

export async function createEvent(
  body: EventCreateApiBody,
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return fetchJson<unknown>("/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
    signal,
    cache: "no-store",
  })
}

export async function updateEvent(
  eventId: string,
  body: EventUpdateApiBody,
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return fetchJson<unknown>(`/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
    signal,
    cache: "no-store",
  })
}
