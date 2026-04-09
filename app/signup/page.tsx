"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { UserPlus } from "lucide-react"

import { setGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import {
  formatAuthErrorMessage,
  isDuplicateSignupError,
} from "@/lib/auth-error-message"
import { createClient } from "@/lib/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required." }),
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      })
    }
  })

type FormValues = z.infer<typeof schema>

type Outcome = "form" | "checkEmail" | "duplicate" | "error"

export default function SignupPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [outcome, setOutcome] = React.useState<Outcome>("form")
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null)
    setInfo(null)

    const appUrl =
      (process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
        window.location.origin) as string
    const emailRedirectTo = `${appUrl}/auth/confirmation`

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      if (isDuplicateSignupError(error)) {
        setOutcome("duplicate")
        return
      }
      setOutcome("error")
      setGeneralError(formatAuthErrorMessage(error))
      return
    }

    const token = data.session?.access_token
    if (!token) {
      setOutcome("checkEmail")
      setInfo(
        "We sent a confirmation link to your email. Open it to finish setting up your account.",
      )
      return
    }

    setGatherlyAccessTokenCookie(token)
    router.replace("/")
  })

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your Gatherly account.</CardDescription>
        </CardHeader>

        <CardContent>
          {outcome === "duplicate" ? (
            <Alert className="border-amber-500/50 bg-amber-50 text-foreground dark:bg-amber-950/30">
              <AlertTitle>This email is already registered</AlertTitle>
              <AlertDescription className="text-foreground/90">
                <p className="mb-3">Try logging in with that email instead.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Go to login</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {outcome === "error" && generalError ? (
            <div className="mb-4 flex flex-col gap-3">
              <p className="text-sm text-red-600">{generalError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOutcome("form")
                  setGeneralError(null)
                }}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {outcome === "checkEmail" && info ? (
            <p className="text-sm text-foreground/80">{info}</p>
          ) : null}

          {outcome === "form" ? (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" autoComplete="name" {...register("fullName")} />
                {errors.fullName?.message ? (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email?.message ? (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password?.message ? (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword?.message ? (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                <UserPlus data-icon="inline-start" className="size-4" aria-hidden />
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          ) : null}

          <p className="mt-4 text-center text-sm text-foreground/80">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Click here to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
