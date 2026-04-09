"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { setGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import {
  formatAuthCallbackQueryError,
  formatAuthErrorMessage,
} from "@/lib/auth-error-message"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function AuthConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = React.useState<"loading" | "error">("loading")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function run() {
      const supabase = createClient()

      const {
        data: { session: existing },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (existing?.access_token) {
        setGatherlyAccessTokenCookie(existing.access_token)
        router.replace("/")
        return
      }

      const qErr = searchParams.get("error")
      const qErrDesc = searchParams.get("error_description")
      if (qErr) {
        setErrorMessage(formatAuthCallbackQueryError(qErr, qErrDesc))
        setPhase("error")
        return
      }

      const code = searchParams.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error))
          setPhase("error")
          return
        }
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.access_token) {
          setGatherlyAccessTokenCookie(session.access_token)
        }
        router.replace("/")
        return
      }

      const tokenHash = searchParams.get("token_hash")
      const typeParam = searchParams.get("type")
      if (tokenHash && typeParam) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: typeParam as "signup" | "email" | "recovery" | "invite" | "magiclink",
        })
        if (cancelled) return
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error))
          setPhase("error")
          return
        }
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.access_token) {
          setGatherlyAccessTokenCookie(session.access_token)
        }
        router.replace("/")
        return
      }

      if (typeof window !== "undefined" && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.slice(1))
        const access_token = hash.get("access_token")
        const refresh_token = hash.get("refresh_token")
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (cancelled) return
          if (error) {
            setErrorMessage(formatAuthErrorMessage(error))
            setPhase("error")
            return
          }
          setGatherlyAccessTokenCookie(access_token)
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
          router.replace("/")
          return
        }
      }

      setErrorMessage(
        process.env.NODE_ENV === "production"
          ? "An unexpected error has occurred, please try again later."
          : "Error (missing_params): No confirmation code or session was found in the URL.",
      )
      setPhase("error")
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  if (phase === "loading") {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Confirming your account</CardTitle>
            <CardDescription>Please wait…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Could not confirm</CardTitle>
          <CardDescription>Something went wrong while confirming your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirming your account</CardTitle>
              <CardDescription>Loading…</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthConfirmationContent />
    </Suspense>
  )
}
