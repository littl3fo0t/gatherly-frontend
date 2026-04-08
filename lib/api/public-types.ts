/**
 * TypeScript shapes for public (unauthenticated) API responses.
 * Prefer validating at runtime with Zod where responses are consumed.
 */
export type ApiPage<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type PublicEventListItem = {
  id: string
  title: string
  eventType: "virtual" | "in_person" | "hybrid"
  admissionType: "free" | "paid"
  admissionFee: number | null
  startTime: string
  endTime: string
  timezone: string
  city: string | null
  province: string | null
  coverImageUrl: string | null
  rsvpCount: number
  maxCapacity: number
  isHot: boolean
  categories: string[]
}

export type PublicCategory = {
  id: string
  name: string
  slug: string
}

