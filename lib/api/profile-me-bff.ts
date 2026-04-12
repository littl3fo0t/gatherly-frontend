/**
 * Same-origin BFF calls to `/api/profiles/me` (cookie-based auth proxy).
 */
import { ApiError } from "@/lib/api/http"
import type { ProfileResponse } from "@/lib/profile-types"

const BFF_PROFILE_ME = "/api/profiles/me"

export type PutProfileMeBody = {
  fullName: string
  avatarUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
}

async function parseResponse<T>(res: Response): Promise<T> {
  const bodyText = await res.text().catch(() => undefined)
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      url: BFF_PROFILE_ME,
      message: `Request failed (${res.status})`,
      bodyText,
    })
  }
  if (!bodyText) {
    throw new ApiError({
      status: res.status,
      url: BFF_PROFILE_ME,
      message: "Empty response body",
    })
  }
  return JSON.parse(bodyText) as T
}

export async function fetchProfileMeBff(signal?: AbortSignal): Promise<ProfileResponse> {
  const res = await fetch(BFF_PROFILE_ME, {
    method: "GET",
    cache: "no-store",
    signal,
  })
  return parseResponse<ProfileResponse>(res)
}

export async function putProfileMeBff(
  body: PutProfileMeBody,
  signal?: AbortSignal,
): Promise<ProfileResponse> {
  const res = await fetch(BFF_PROFILE_ME, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  })
  return parseResponse<ProfileResponse>(res)
}
