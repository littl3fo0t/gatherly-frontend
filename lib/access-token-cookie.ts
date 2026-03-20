/**
 * Sets a non-httpOnly cookie so the Supabase access token is readable in the browser
 * (for API testing). Call only from client components / browser code.
 */
export function setGatherlyAccessTokenCookie(token: string) {
  if (typeof window === "undefined") return

  const secure = window.location.protocol === "https:"
  document.cookie = `gatherly_access_token=${encodeURIComponent(token)}; path=/; SameSite=Lax${
    secure ? "; Secure" : ""
  }`
}
