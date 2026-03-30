"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LogIn } from "lucide-react"

import { setGatherlyAccessTokenCookie } from "@/lib/access-token-cookie"
import { formatAuthErrorMessage } from "@/lib/auth-error-message"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
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

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setGeneralError(formatAuthErrorMessage(error))
      return
    }

    const token = data.session?.access_token
    if (!token) {
      setGeneralError(
        process.env.NODE_ENV === "production"
          ? "An unexpected error has occurred, please try again later."
          : "Error (no_token): Login succeeded but no access token was returned.",
      )
      return
    }

    setGatherlyAccessTokenCookie(token)
    router.replace("/dashboard")
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

            <Button type="submit" disabled={isSubmitting}>
              <LogIn data-icon="inline-start" className="size-4" aria-hidden />
              {isSubmitting ? "Logging you in…" : "Login"}
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
