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
        // Zod v4: issue codes are strings; `z.ZodIssueCode.*` is deprecated.
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
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

  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const onSubmit = handleSubmit(async (values) => {
    setGeneralError(null)
    setInfo(null)

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      setGeneralError(error.message)
      return
    }

    const token = data.session?.access_token
    if (!token) {
      // Email confirmation is enabled, so session/access_token may be absent until user confirms.
      setInfo("Check your email to confirm your account.")
      return
    }

    setGatherlyAccessTokenCookie(token)
    // Intentional: rare path when email confirmation returns a session; log for API testing.
    console.log("Supabase access_token:", token)
    setInfo("Account created. You can use your saved session for API requests.")
  })

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your Gatherly account.</CardDescription>
        </CardHeader>

        <CardContent>
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

            {generalError ? <p className="text-sm text-red-600">{generalError}</p> : null}
            {info ? <p className="text-sm text-foreground/80">{info}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

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

