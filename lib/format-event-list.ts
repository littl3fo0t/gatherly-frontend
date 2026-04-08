/**
 * Formats event start/end for list cards (Canada locale, organizer IANA timezone).
 */
function safeTimeZone(timeZone: string) {
  // Some seed/dev data may use placeholders (e.g. "string") which crash Intl.
  // Fall back to UTC to keep rendering resilient.
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
    return timeZone
  } catch {
    return "UTC"
  }
}

export function formatEventListDate(isoStart: string, timeZone: string): string {
  const tz = safeTimeZone(timeZone)
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeZone: tz,
  }).format(new Date(isoStart))
}

export function formatEventListTimeRange(
  isoStart: string,
  isoEnd: string,
  timeZone: string,
): string {
  const tz = safeTimeZone(timeZone)
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeStyle: "short",
    timeZone: tz,
  })
  return `${formatter.format(new Date(isoStart))} – ${formatter.format(new Date(isoEnd))}`
}
