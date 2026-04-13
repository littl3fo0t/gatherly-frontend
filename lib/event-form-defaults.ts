import type { PublicEventDetail } from "@/lib/api/event-detail-schema"
import type { PublicCategory } from "@/lib/api/public-types"
import { defaultCreateFormValues, type EventFormValues } from "@/lib/event-form-schema"

/**
 * Map public event detail + organizer `meetingLink` + category catalog to form values.
 * Category names match first catalog row per name (see API note on name collisions).
 */
export function publicDetailToFormValues(
  detail: PublicEventDetail,
  meetingLink: string | null | undefined,
  categories: PublicCategory[],
): EventFormValues {
  const nameToId = new Map(categories.map((c) => [c.name, c.id]))
  const categoryIds = detail.categories
    .map((name) => nameToId.get(name))
    .filter((x): x is string => Boolean(x))
    .slice(0, 3)

  const addr = detail.address

  return {
    title: detail.title,
    description: detail.description,
    eventType: detail.eventType,
    admissionType: detail.admissionType,
    admissionFee: detail.admissionFee != null ? String(detail.admissionFee) : "",
    startTime: detail.startTime,
    endTime: detail.endTime,
    timezone: detail.timezone,
    addressLine1: addr?.addressLine1 ?? "",
    addressLine2: addr?.addressLine2 ?? "",
    city: addr?.city ?? "",
    province: addr?.province ?? "",
    postalCode: addr?.postalCode ?? "",
    meetingLink: meetingLink?.trim() ? meetingLink : "",
    coverImageUrl: detail.coverImageUrl ?? "",
    maxCapacity: String(detail.maxCapacity),
    categoryIds,
  }
}

export function resetValuesForMode(
  mode: "create" | "edit",
  detail: PublicEventDetail | undefined,
  meetingLink: string | null | undefined,
  categories: PublicCategory[] | undefined,
): EventFormValues {
  if (mode === "create") return defaultCreateFormValues()
  if (!detail || !categories) return defaultCreateFormValues()
  return publicDetailToFormValues(detail, meetingLink, categories)
}
