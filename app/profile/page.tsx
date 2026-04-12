"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Calendar, Crown, ImageUp, UserCircle } from "lucide-react"

import { ProfileAddressSection } from "@/components/profile-address-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/http"
import { fetchProfileMeBff } from "@/lib/api/profile-me-bff"
import { queryKeys } from "@/lib/query-keys"

function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const parts = document.cookie.split(";").map((p) => p.trim())
  const match = parts.find((p) => p.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(name.length + 1))
}

function formatMemberSince(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Unknown"
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-72" />
          <Skeleton className="mt-2 h-9 w-40" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const token = mounted ? readCookie("gatherly_access_token") : null
  const enabled = mounted && !!token

  React.useEffect(() => {
    if (mounted && !token) {
      router.replace("/login")
    }
  }, [mounted, token, router])

  const { data: profile, isPending, isError, error } = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: ({ signal }) => fetchProfileMeBff(signal),
    enabled,
    staleTime: 60_000,
  })

  React.useEffect(() => {
    if (!isError || !(error instanceof ApiError)) return
    if (error.status === 401 || error.status === 404) {
      router.replace("/login")
    }
  }, [isError, error, router])

  if (!mounted) {
    return <ProfileSkeleton />
  }

  if (!token) {
    return null
  }

  if (isError) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return null
    }

    if (process.env.NODE_ENV === "development") {
      if (error instanceof ApiError && error.bodyText) {
        try {
          // eslint-disable-next-line no-console
          console.log(JSON.parse(error.bodyText))
        } catch {
          // eslint-disable-next-line no-console
          console.log(error.bodyText)
        }
      } else {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }

    return (
      <div className="py-10">
        <p className="text-base leading-relaxed text-foreground">
          An unexpected error occurred when trying to retrieve your profile information. Please try again
          later.
        </p>
      </div>
    )
  }

  if (isPending || !profile) {
    return <ProfileSkeleton />
  }

  const role = (profile.role ?? "").toString()
  const showModerator = role === "moderator"
  const showAdmin = role === "admin"

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.fullName} /> : null}
          <AvatarFallback aria-label="No avatar">
            <UserCircle className="size-8 text-muted-foreground" aria-hidden />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{profile.fullName}</h1>
            {showAdmin ? (
              <Badge variant="default">
                <Crown data-icon="inline-start" className="size-3.5" aria-hidden />
                Admin
              </Badge>
            ) : null}
            {showModerator ? <Badge variant="outline">Moderator</Badge> : null}
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">{profile.email}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" disabled>
              <ImageUp data-icon="inline-start" className="size-4" aria-hidden />
              Change avatar
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" aria-hidden />
              <span>Member since {formatMemberSince(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      <ProfileAddressSection profile={profile} />
    </div>
  )
}
