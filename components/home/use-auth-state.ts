"use client"

import * as React from "react"

import { createClient } from "@/lib/client"

/**
 * Shared client-side auth UI state for the landing experience.
 * Mirrors the session + onAuthStateChange wiring used by other auth-aware UI (e.g. header/CTAs),
 * so multiple components can gate content without duplicating Supabase subscriptions.
 */
export type AuthState = "loading" | "out" | "in"

export function useAuthState(): AuthState {
  const supabase = React.useMemo(() => createClient(), [])
  const [auth, setAuth] = React.useState<AuthState>("loading")

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuth(data.session?.user ? "in" : "out")
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ? "in" : "out")
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  return auth
}

