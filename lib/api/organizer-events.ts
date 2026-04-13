import { z } from "zod"

import { fetchJson } from "@/lib/api/http"
import type { ApiPage } from "@/lib/api/public-types"

const addressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
})

/** One row from `GET /events/my` `content` (fields used for edit prefill). */
export const organizerEventRowSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    eventType: z.enum(["virtual", "in_person", "hybrid"]),
    admissionType: z.enum(["free", "paid"]),
    admissionFee: z.number().nullable(),
    meetingLink: z.string().nullable().optional(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string(),
    address: addressSchema.nullable().optional(),
    coverImageUrl: z.string().nullable(),
    rsvpCount: z.number(),
    maxCapacity: z.number(),
    categories: z.array(z.string()),
  })
  .passthrough()

export type OrganizerEventRow = z.infer<typeof organizerEventRowSchema>

const myEventsPageSchema = z.object({
  content: z.array(organizerEventRowSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
})

export async function fetchMyEventsPage(
  args: {
    accessToken: string
    page?: number
    size?: number
    signal?: AbortSignal
  },
): Promise<ApiPage<OrganizerEventRow>> {
  const page = args.page ?? 0
  const size = args.size ?? 100
  const raw = await fetchJson<unknown>(`/events/my?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${args.accessToken}` },
    signal: args.signal,
    cache: "no-store",
  })
  const parsed = myEventsPageSchema.parse(raw)
  return parsed
}

/**
 * Locate an event in paginated `GET /events/my` results (for `meetingLink` and parity with dashboard).
 */
export async function fetchOrganizerEventById(
  eventId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<OrganizerEventRow | null> {
  let page = 0
  const size = 100
  while (true) {
    const res = await fetchMyEventsPage({ accessToken, page, size, signal })
    const found = res.content.find((e) => e.id === eventId) ?? null
    if (found) return found
    if (res.totalPages <= 0 || page >= res.totalPages - 1) return null
    page += 1
  }
}
