/**
 * Parse and serialize `page` / `size` for the public events listing URL.
 * Matches `GET /events?page=&size=` (0-based page; size from allowed set).
 */

export const EVENTS_LIST_DEFAULT_PAGE = 0
export const EVENTS_LIST_DEFAULT_SIZE = 25
export const EVENTS_LIST_MAX_SIZE = 100

/** User-selectable page sizes; values outside this set are normalized to the nearest. */
export const EVENTS_LIST_ALLOWED_SIZES = [12, 25, 50] as const

export type EventsListingParams = {
  page: number
  size: number
}

function parsePositiveInt(raw: string | null): number | undefined {
  if (raw == null || raw === "") return undefined
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return undefined
  return n
}

function normalizeSize(raw: number | undefined): number {
  if (raw === undefined || raw < 1) return EVENTS_LIST_DEFAULT_SIZE
  const clamped = Math.min(Math.round(raw), EVENTS_LIST_MAX_SIZE)
  let nearest: (typeof EVENTS_LIST_ALLOWED_SIZES)[number] = EVENTS_LIST_ALLOWED_SIZES[0]
  let best = Math.abs(nearest - clamped)
  for (const s of EVENTS_LIST_ALLOWED_SIZES) {
    const d = Math.abs(s - clamped)
    if (d < best) {
      best = d
      nearest = s
    }
  }
  return nearest
}

function normalizePage(raw: number | undefined): number {
  if (raw === undefined || raw < 0 || !Number.isFinite(raw)) return EVENTS_LIST_DEFAULT_PAGE
  return Math.max(0, Math.floor(raw))
}

/**
 * Read and normalize listing params from the current URL search string.
 */
export function parseEventsListingParams(searchParams: URLSearchParams): EventsListingParams {
  const page = normalizePage(parsePositiveInt(searchParams.get("page")))
  const size = normalizeSize(parsePositiveInt(searchParams.get("size")))
  return { page, size }
}

/**
 * Build query string for events listing: keeps unrelated keys, applies canonical defaults
 * (omit `page` when 0, omit `size` when default 25).
 */
export function serializeEventsListingParams(
  page: number,
  size: number,
  preserve: URLSearchParams,
): string {
  const p = new URLSearchParams(preserve.toString())
  p.delete("page")
  p.delete("size")
  if (page > EVENTS_LIST_DEFAULT_PAGE) {
    p.set("page", String(page))
  }
  if (size !== EVENTS_LIST_DEFAULT_SIZE) {
    p.set("size", String(size))
  }
  return p.toString()
}

/**
 * Full href for the listing with the given page/size (0-based page).
 * Optional hash (e.g. `events` for `#events`) keeps scroll position on the home page.
 */
export function buildEventsListingHref(
  pathname: string,
  page: number,
  size: number,
  preserve: URLSearchParams,
  hash?: string,
): string {
  const qs = serializeEventsListingParams(page, size, preserve)
  const base = qs ? `${pathname}?${qs}` : pathname
  if (!hash) return base
  const h = hash.startsWith("#") ? hash.slice(1) : hash
  return h ? `${base}#${h}` : base
}
