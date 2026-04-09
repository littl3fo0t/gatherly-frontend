"use client"

import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon, LayoutList } from "lucide-react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildEventsListingHref,
  EVENTS_LIST_ALLOWED_SIZES,
} from "@/lib/public-events-search-params"
import { cn } from "@/lib/utils"

function visiblePageIndices(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }
  const set = new Set<number>()
  set.add(0)
  set.add(totalPages - 1)
  for (let d = -1; d <= 1; d++) {
    const x = current + d
    if (x >= 0 && x < totalPages) set.add(x)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("ellipsis")
    }
    out.push(sorted[i])
  }
  return out
}

export type PublicEventsPaginationProps = {
  pathname: string
  preservedSearch: URLSearchParams
  currentPage: number
  totalPages: number
  size: number
  /** Hash without leading `#` (home listing section). */
  listHash?: string
}

export function PublicEventsPagination({
  pathname,
  preservedSearch,
  currentPage,
  totalPages,
  size,
  listHash,
}: PublicEventsPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const hrefForPage = (p: number) =>
    buildEventsListingHref(pathname, p, size, preservedSearch, listHash)

  const prevHref = hrefForPage(currentPage - 1)
  const nextHref = hrefForPage(currentPage + 1)
  const items = visiblePageIndices(currentPage, totalPages)

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {currentPage > 0 ? (
            <PaginationPrevious href={prevHref} />
          ) : (
            <span
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1 rounded-lg pl-1.5 pr-2 text-sm text-muted-foreground",
                "pointer-events-none opacity-50",
              )}
              aria-disabled="true"
            >
              <ChevronLeftIcon data-icon="inline-start" className="size-4" aria-hidden />
              <span className="hidden sm:inline">Previous</span>
            </span>
          )}
        </PaginationItem>
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={hrefForPage(item)} isActive={item === currentPage} size="icon">
                {item + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          {currentPage < totalPages - 1 ? (
            <PaginationNext href={nextHref} />
          ) : (
            <span
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1 rounded-lg pl-2 pr-1.5 text-sm text-muted-foreground",
                "pointer-events-none opacity-50",
              )}
              aria-disabled="true"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon data-icon="inline-end" className="size-4" aria-hidden />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export type PublicEventsSizeSelectProps = {
  pathname: string
  preservedSearch: URLSearchParams
  size: number
  listHash?: string
}

export function PublicEventsSizeSelect({
  pathname,
  preservedSearch,
  size,
  listHash,
}: PublicEventsSizeSelectProps) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LayoutList className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <Label htmlFor="events-page-size" className="text-sm text-foreground">
        Per page
      </Label>
      <Select
        value={String(size)}
        onValueChange={(value) => {
          const nextSize = Number(value)
          const href = buildEventsListingHref(
            pathname,
            0,
            nextSize,
            preservedSearch,
            listHash,
          )
          router.replace(href)
        }}
      >
        <SelectTrigger id="events-page-size" size="sm" className="w-[100px]" aria-label="Events per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EVENTS_LIST_ALLOWED_SIZES.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
