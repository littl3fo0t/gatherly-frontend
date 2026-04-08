"use client"

import { useQuery } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import { EventList } from "@/components/events/event-list"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublicEvents } from "@/lib/api/public"
import { ApiError } from "@/lib/api/http"
import { queryKeys } from "@/lib/query-keys"

const PAGE = 0
const PAGE_SIZE = 25

function EventCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10">
      <Skeleton className="aspect-video w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="border-t border-border bg-muted/30 p-4">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

export function HomePublicEvents() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.public.events(PAGE, PAGE_SIZE),
    queryFn: () => getPublicEvents({ page: PAGE, size: PAGE_SIZE }),
    staleTime: 45_000,
  })

  if (isPending) {
    return (
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <EventCardSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? `Something went wrong (${error.status}).`
        : error instanceof Error
          ? error.message
          : "Something went wrong."

    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load events</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="border-destructive/40"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw data-icon="inline-start" className="size-4" aria-hidden />
            Try again
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  return (
    <EventList
      events={data.content}
      emptyMessage="No active events are listed right now. Check back soon."
    />
  )
}
