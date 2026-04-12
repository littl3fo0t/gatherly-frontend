"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flag,
  Flame,
  ImageIcon,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { z } from "zod"

import { AppShell } from "@/components/app-shell"
import { OrganizerDetails } from "@/components/events/organizer-details"
import { SafeEventDescription } from "@/components/events/safe-event-description"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabaseSessionHydration } from "@/hooks/use-supabase-session-hydration"
import { fetchPublicEventDetail } from "@/lib/api/event-detail"
import { ApiError } from "@/lib/api/http"
import type { PublicEventDetail } from "@/lib/api/event-detail-schema"
import { formatEventListDate, formatEventListTimeRange } from "@/lib/format-event-list"
import { getAppRoleFromUser, isModeratorOrAdmin } from "@/lib/app-role"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

function eventTypeLabel(type: PublicEventDetail["eventType"]): string {
  switch (type) {
    case "virtual":
      return "Virtual"
    case "in_person":
      return "In-Person"
    case "hybrid":
      return "Hybrid"
    default:
      return type
  }
}

function admissionLabel(
  admissionType: PublicEventDetail["admissionType"],
  admissionFee: PublicEventDetail["admissionFee"],
): string {
  if (admissionType === "free") return "Free"
  if (admissionFee != null) {
    return `Paid · $${admissionFee.toFixed(2)} CAD`
  }
  return "Paid"
}

function formatAddressLine(address: NonNullable<PublicEventDetail["address"]>): string {
  const line2 = address.addressLine2?.trim()
  const parts = [address.addressLine1, line2, address.city, address.province, address.postalCode].filter(
    Boolean,
  ) as string[]
  return parts.join(", ")
}

function EventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Skeleton className="h-10 w-full max-w-xl" />
        <div className="flex shrink-0 flex-wrap justify-end gap-2 self-end sm:self-start">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export type EventDetailViewProps = {
  eventId: string
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const { hydrated, session } = useSupabaseSessionHydration()
  const authed = Boolean(session?.access_token)
  const idValid = z.string().uuid().safeParse(eventId).success

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.public.eventDetail(eventId, authed),
    queryFn: ({ signal }) =>
      fetchPublicEventDetail(eventId, {
        accessToken: session?.access_token,
        signal,
      }),
    enabled: hydrated && idValid,
  })

  const user = session?.user ?? null
  const appRole = getAppRoleFromUser(user)
  const showFlag = isModeratorOrAdmin(appRole)

  let body: React.ReactNode

  if (!idValid) {
    body = (
      <Alert variant="destructive">
        <AlertTitle>Invalid link</AlertTitle>
        <AlertDescription>This event URL is not valid.</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="default" className="border-destructive/40" asChild>
            <Link href="/">
              <ArrowLeft data-icon="inline-start" className="size-4" aria-hidden />
              Back to home
            </Link>
          </Button>
        </AlertAction>
      </Alert>
    )
  } else if (isError) {
    const notFound = error instanceof ApiError && error.status === 404
    const message =
      error instanceof ApiError
        ? notFound
          ? "This event is not available or may have been removed."
          : `Something went wrong (${error.status}).`
        : error instanceof Error
          ? error.message
          : "Something went wrong."

    body = (
      <Alert variant={notFound ? "default" : "destructive"}>
        <AlertTitle>{notFound ? "Event not found" : "Could not load event"}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="default"
            className={cn(!notFound && "border-destructive/40")}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw data-icon="inline-start" className="size-4" aria-hidden />
            Try again
          </Button>
        </AlertAction>
      </Alert>
    )
  } else if (isPending || !data) {
    body = <EventDetailSkeleton />
  } else {
    const dateLine = formatEventListDate(data.startTime, data.timezone)
    const timeLine = formatEventListTimeRange(data.startTime, data.endTime, data.timezone)
    const categoryBadges = data.categories.slice(0, 3)
    const showLocation = data.eventType === "in_person" || data.eventType === "hybrid"
    const locationText = data.address ? formatAddressLine(data.address) : null

    const organizer = data.organizer
    const showOrganizer = Boolean(session && organizer)
    const isOrganizer = Boolean(session && organizer && user?.id === organizer.id)

    body = (
      <article className="flex flex-col gap-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
          {data.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote CDN URLs
            <img src={data.coverImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-12" aria-hidden />
            </div>
          )}
          {data.isHot ? (
            <Badge
              variant="default"
              className="absolute left-3 top-3 gap-1 bg-foreground text-background"
            >
              <Flame className="size-3" aria-hidden />
              Hot
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:flex-1">{data.title}</h1>
          <div className="flex shrink-0 flex-wrap justify-end gap-2 sm:pt-0.5">
            {isOrganizer ? (
              <Button type="button" variant="outline" size="default" disabled>
                <Pencil data-icon="inline-start" className="size-4" aria-hidden />
                Edit Event
              </Button>
            ) : null}
            {isOrganizer ? (
              <Button type="button" variant="destructive" size="default" disabled>
                <Trash2 data-icon="inline-start" className="size-4" aria-hidden />
                Delete Event
              </Button>
            ) : null}
            {showFlag ? (
              <Button type="button" variant="destructive" size="default" disabled>
                <Flag data-icon="inline-start" className="size-4" aria-hidden />
                Flag
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{admissionLabel(data.admissionType, data.admissionFee)}</Badge>
          <Badge variant="outline">{eventTypeLabel(data.eventType)}</Badge>
          {categoryBadges.map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
            <span>{dateLine}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
            <span>{timeLine}</span>
          </div>
        </div>

        {showLocation && locationText ? (
          <p className="text-base leading-relaxed text-foreground">
            <span className="font-medium text-muted-foreground">Location · </span>
            {locationText}
          </p>
        ) : null}

        <Separator />

        <SafeEventDescription html={data.description} />

        {showOrganizer && organizer ? (
          <OrganizerDetails id={organizer.id} name={organizer.fullName} />
        ) : null}
      </article>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Button variant="outline" size="default" className="w-fit" asChild>
          <Link href="/#events">
            <ArrowLeft data-icon="inline-start" className="size-4" aria-hidden />
            Back to events
          </Link>
        </Button>
        {body}
      </div>
    </AppShell>
  )
}
