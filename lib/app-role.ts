/**
 * Application role from `profiles.role`, exposed on the user as
 * `app_metadata.role` (JWT). That value is synced from `profiles` into
 * `auth.users.raw_app_meta_data` (see DB migration) so it works without relying
 * on the Custom Access Token hook being enabled in the dashboard.
 *
 * The top-level JWT `role` claim is only ever `authenticated` | `anon` (Supabase
 * Auth); it is not your app role.
 */
export type AppRole = "user" | "moderator" | "admin"

const APP_ROLES: readonly AppRole[] = ["user", "moderator", "admin"]

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value)
}

/** Read app role from Supabase `User.app_metadata` (JWT `app_metadata.role`). */
export function getAppRoleFromUser(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
): AppRole {
  const raw = user?.app_metadata?.role
  if (isAppRole(raw)) {
    return raw
  }
  return "user"
}

export function isModeratorOrAdmin(role: AppRole): boolean {
  return role === "moderator" || role === "admin"
}
