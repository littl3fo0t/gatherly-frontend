"use client"

import * as React from "react"
import type { Session } from "@supabase/supabase-js"

import { createClient } from "@/lib/client"

export type SupabaseSessionHydration = {
  hydrated: boolean
  session: Session | null
}

/**
 * Waits for the first `getSession()` result, then keeps `session` in sync via
 * `onAuthStateChange`. Use before public API calls that depend on optional JWT
 * (e.g. event detail with organizer).
 */
export function useSupabaseSessionHydration(): SupabaseSessionHydration {
  const supabase = React.useMemo(() => createClient(), [])
  const [state, setState] = React.useState<SupabaseSessionHydration>({
    hydrated: false,
    session: null,
  })

  React.useEffect(() => {
    let cancelled = false

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setState({
        hydrated: true,
        session: data.session ?? null,
      })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        hydrated: true,
        session,
      })
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  return state
}
