"use client"

import * as React from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { EventList } from "@/components/events/event-list"
import {
  PublicEventsPagination,
  PublicEventsSizeSelect,
} from "@/components/home/public-events-pagination"
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
import {
  buildEventsListingHref,
  parseEventsListingParams,
} from "@/lib/public-events-search-params"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

const EVENTS_SECTION_HASH = "events"

export function HomePublicEventsSkeleton() {
  return (
    <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
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
        </li>
      ))}
    </ul>
  )
}

export function HomePublicEvents() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const preservedSearch = React.useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  )

  const { page, size } = React.useMemo(
    () => parseEventsListingParams(new URLSearchParams(searchParamsString)),
    [searchParamsString],
  )

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.public.events(page, size),
    queryFn: () => getPublicEvents({ page, size }),
    staleTime: 45_000,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    if (!data || data.totalPages <= 0) return
    if (page >= data.totalPages) {
      const lastPage = data.totalPages - 1
      router.replace(
        buildEventsListingHref(pathname, lastPage, size, preservedSearch, EVENTS_SECTION_HASH),
      )
    }
  }, [data, page, pathname, preservedSearch, router, size])

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

  if (data === undefined) {
    return <HomePublicEventsSkeleton />
  }

  const totalPages = Math.max(0, data.totalPages)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <PublicEventsSizeSelect
          pathname={pathname}
          preservedSearch={preservedSearch}
          size={size}
          listHash={EVENTS_SECTION_HASH}
        />
        {isFetching && !isPending ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Updating list…
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "transition-opacity duration-200",
          isFetching && !isPending ? "opacity-80" : "opacity-100",
        )}
      >
        <EventList
          events={data.content}
          emptyMessage="No active events are listed right now. Check back soon."
        />
      </div>

      <PublicEventsPagination
        pathname={pathname}
        preservedSearch={preservedSearch}
        currentPage={page}
        totalPages={totalPages}
        size={size}
        listHash={EVENTS_SECTION_HASH}
      />
    </div>
  )
}
