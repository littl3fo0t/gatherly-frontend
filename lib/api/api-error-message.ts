import { ApiError } from "@/lib/api/http"

/** Best-effort parse of Spring-style JSON error bodies for UI copy. */
export function getApiErrorMessageForUser(error: unknown): string | null {
  if (!(error instanceof ApiError) || !error.bodyText?.trim()) return null
  try {
    const j = JSON.parse(error.bodyText) as { message?: string; error?: string }
    return j.message ?? j.error ?? null
  } catch {
    return error.bodyText.length > 200 ? `${error.bodyText.slice(0, 200)}…` : error.bodyText
  }
}
