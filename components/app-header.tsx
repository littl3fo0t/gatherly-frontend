"use client"

/**
 * Shared shell header (see docs/layout.md): wordmark, auth-aware actions, separator.
 * Login/signup pages omit the shell; all other app routes that use AppShell include this.
 */
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { LogIn, LogOut, User, UserPlus } from "lucide-react"

import { clearGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

/** Derived UI state while the first Supabase session read is in flight. */
type AuthState = "loading" | "out" | "in"

export function AppHeader() {
  const router = useRouter()
  /** Same QueryClient as QueryProvider — cleared on logout so no stale user data remains. */
  const queryClient = useQueryClient()
  const supabase = React.useMemo(() => createClient(), [])
  const [auth, setAuth] = React.useState<AuthState>("loading")

  React.useEffect(() => {
    // Initial session (e.g. refresh) so we don’t flash the wrong button group.
    supabase.auth.getSession().then(({ data }) => {
      setAuth(data.session?.user ? "in" : "out")
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setAuth(session?.user ? "in" : "out")
      // Remote or other-tab sign-out: wipe API cookie and React Query cache here too.
      if (event === "SIGNED_OUT") {
        clearGatherlyAccessTokenCookie()
        queryClient.clear()
      }
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [supabase, queryClient])

  async function handleLogout() {
    await supabase.auth.signOut()
    clearGatherlyAccessTokenCookie()
    queryClient.clear()
    router.replace("/login")
  }

  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4">
        {/*
          Wordmark: layout spec points to “home” as dashboard; the marketing landing lives at /.
          If / replaces /dashboard later, switch href to "/" (or role-based home).
        */}
        <Link href="/dashboard" className="text-base font-bold tracking-tight text-foreground">
          Gatherly
        </Link>
        <div className="flex items-center gap-2">
          {auth === "loading" ? (
            <div className="h-8 w-36 animate-pulse rounded-md bg-muted" aria-hidden />
          ) : auth === "out" ? (
            <>
              <Button variant="outline" size="default" asChild>
                <Link href="/login">
                  <LogIn data-icon="inline-start" className="size-4" aria-hidden />
                  Login
                </Link>
              </Button>
              <Button variant="default" size="default" asChild>
                <Link href="/signup">
                  <UserPlus data-icon="inline-start" className="size-4" aria-hidden />
                  Sign Up
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="default" asChild>
                <Link href="/profile">
                  <User data-icon="inline-start" className="size-4" aria-hidden />
                  Profile
                </Link>
              </Button>
              <Button variant="destructive" size="default" type="button" onClick={handleLogout}>
                <LogOut data-icon="inline-start" className="size-4" aria-hidden />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Full-width rule under the header row (layout.md). */}
      <Separator />
    </header>
  )
}
