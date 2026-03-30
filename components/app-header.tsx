"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, User, UserPlus } from "lucide-react"

import { clearGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type AuthState = "loading" | "out" | "in"

export function AppHeader() {
  const router = useRouter()
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

  async function handleLogout() {
    await supabase.auth.signOut()
    clearGatherlyAccessTokenCookie()
    router.replace("/login")
  }

  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4">
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
      <Separator />
    </header>
  )
}
