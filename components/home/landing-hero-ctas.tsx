"use client"

/**
 * Landing hero call-to-actions driven by Supabase session (mirrors AppHeader auth wiring).
 * Unauthenticated: signup, login, browse. Authenticated: create event / browse.
 * Profile and logout stay in the header only.
 *
 * Uses `useAuthState()` so other landing elements can share the same auth-derived UI state.
 */
import * as React from "react"
import Link from "next/link"
import {
  CalendarPlus,
  LogIn,
  Search,
  UserPlus,
} from "lucide-react"

import { useAuthState } from "@/components/home/use-auth-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function LandingHeroCtas() {
  const auth = useAuthState()

  // Provide stable button layout while auth state resolves.
  if (auth === "loading") {
    return (
      <div
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        aria-busy="true"
        aria-label="Loading actions"
      >
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
    )
  }

  // Guest funnel; “Browse events” stays so discovery is never gated.
  if (auth === "out") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button variant="default" size="lg" asChild>
          <Link href="/signup">
            <UserPlus data-icon="inline-start" className="size-4" aria-hidden />
            Sign up
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/login">
            <LogIn data-icon="inline-start" className="size-4" aria-hidden />
            Log in
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="#events">
            <Search data-icon="inline-start" className="size-4" aria-hidden />
            Browse events
          </Link>
        </Button>
      </div>
    )
  }

  // Signed-in: task CTAs to dashboard until a dedicated /events/new (or modal) exists.
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button variant="default" size="lg" asChild>
        <Link href="/dashboard">
          <CalendarPlus data-icon="inline-start" className="size-4" aria-hidden />
          Create event
        </Link>
      </Button>
      <Button variant="outline" size="lg" asChild>
        <Link href="#events">
          <Search data-icon="inline-start" className="size-4" aria-hidden />
          Browse events
        </Link>
      </Button>
    </div>
  )
}
