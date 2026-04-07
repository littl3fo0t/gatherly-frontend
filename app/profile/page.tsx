"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar, Crown, ImageUp, Pencil, UserCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

type ProfileResponse = {
  id: string
  fullName: string
  email: string
  role: "user" | "moderator" | "admin" | string
  avatarUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  createdAt: string
  updatedAt: string
}

type Phase = "loading" | "redirecting" | "ready" | "error500"

function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const parts = document.cookie.split(";").map((p) => p.trim())
  const match = parts.find((p) => p.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(name.length + 1))
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${b}${p}`
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

  const [phase, setPhase] = React.useState<Phase>("loading")
  const [profile, setProfile] = React.useState<ProfileResponse | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function run() {
      const token = readCookie("gatherly_access_token")
      if (!token) {
        setPhase("redirecting")
        router.replace("/login")
        return
      }

      const url = "/api/profiles/me"
      let res: Response
      try {
        res = await fetch(url, {
          method: "GET",
          cache: "no-store",
        })
      } catch (e) {
        if (cancelled) return
        setPhase("error500")
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log(e)
        }
        return
      }

      if (cancelled) return

      if (res.status === 401 || res.status === 404) {
        setPhase("redirecting")
        router.replace("/login")
        return
      }

      if (res.status === 500) {
        setPhase("error500")
        if (process.env.NODE_ENV === "development") {
          const obj = await res.json().catch(() => null)
          // eslint-disable-next-line no-console
          console.log(obj)
        }
        return
      }

      if (!res.ok) {
        setPhase("error500")
        if (process.env.NODE_ENV === "development") {
          const obj = await res.json().catch(() => null)
          // eslint-disable-next-line no-console
          console.log(obj)
        }
        return
      }

      const data = (await res.json()) as ProfileResponse
      setProfile(data)
      setPhase("ready")
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router])

  if (phase === "redirecting") return null

  if (phase === "error500") {
    return (
      <div className="py-10">
        <p className="text-base leading-relaxed text-foreground">
          An unexpected error occurred when trying to retrieve your profile information. Please try again
          later.
        </p>
      </div>
    )
  }

  if (phase !== "ready" || !profile) {
    return <ProfileSkeleton />
  }

  const role = (profile.role ?? "").toString()
  const showModerator = role === "moderator"
  const showAdmin = role === "admin"

  const address = {
    line1: profile.addressLine1 ?? "",
    line2: profile.addressLine2 ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
    postalCode: profile.postalCode ?? "",
  }

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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Address</h2>
          <Button type="button" variant="outline" disabled>
            <Pencil data-icon="inline-start" className="size-4" aria-hidden />
            Edit
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input id="addressLine1" value={address.line1} placeholder="Not provided" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input id="addressLine2" value={address.line2} placeholder="Not provided" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={address.city} placeholder="Not provided" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="province">Province</Label>
            <Input id="province" value={address.province} placeholder="Not provided" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" value={address.postalCode} placeholder="Not provided" disabled />
          </div>
        </div>
      </section>
    </div>
  )
}
