"use client"

import * as React from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { setGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const supabase = React.useMemo(() => createClient(), [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null)
    setSuccessMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setGeneralError(error.message)
      return
    }

    const token = data.session?.access_token
    if (!token) {
      // Unexpected for sign-in, but we handle it safely.
      setGeneralError("Login succeeded but no access token was returned.")
      return
    }

    setGatherlyAccessTokenCookie(token)
    // Intentional: copy JWT for testing the separate backend API (Bearer token).
    console.log("Supabase access_token:", token)
    setSuccessMessage("Signed in successfully. Your session token is stored for API requests.")
  })

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your Gatherly account.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password?.message ? (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            {generalError ? <p className="text-sm text-red-600">{generalError}</p> : null}
            {successMessage ? (
              <p className="text-sm text-foreground/80">{successMessage}</p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-foreground/80">
            Don&#39;t have an account yet?{" "}
            <Link href="/signup" className="font-medium text-foreground underline">
              Click here to signup
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

