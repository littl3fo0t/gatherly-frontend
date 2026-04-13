"use client"

import * as React from "react"

/**
 * Landing hero call-to-actions driven by Supabase session (mirrors AppHeader auth wiring).
 * Unauthenticated: signup, login, browse. Authenticated: create event / browse.
 * Profile and logout stay in the header only.
 *
 * Uses `useAuthState()` so other landing elements can share the same auth-derived UI state.
 */
import Link from "next/link"
import {
  CalendarPlus,
  LogIn,
  Search,
  UserPlus,
} from "lucide-react"

import { EventUpsertDialog } from "@/components/events/event-upsert-dialog"
import { useAuthState } from "@/components/home/use-auth-state"
import { useSupabaseSessionHydration } from "@/hooks/use-supabase-session-hydration"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function LandingHeroCtas() {
  const auth = useAuthState()
  const [createOpen, setCreateOpen] = React.useState(false)
  const { session } = useSupabaseSessionHydration()

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

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <EventUpsertDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        accessToken={session?.access_token ?? null}
      />
      <Button variant="default" size="lg" type="button" onClick={() => setCreateOpen(true)}>
        <CalendarPlus data-icon="inline-start" className="size-4" aria-hidden />
        Create event
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
