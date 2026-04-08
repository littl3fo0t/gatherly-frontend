import type { ReactNode } from "react"

import type { PublicEventListItem } from "@/lib/api/public-types"
import { cn } from "@/lib/utils"

import { EventCard } from "@/components/events/event-card"

export type EventListProps = {
  events: PublicEventListItem[]
  /** Optional map of event id → preview description when not on the list DTO. */
  descriptionsByEventId?: Record<string, string | null | undefined>
  className?: string
  listClassName?: string
  emptyMessage?: ReactNode
}

export function EventList({
  events,
  descriptionsByEventId,
  className,
  listClassName,
  emptyMessage = "No events to show yet.",
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-base leading-relaxed text-muted-foreground",
          className,
        )}
        role="status"
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul
      className={cn(
        "grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3",
        listClassName,
        className,
      )}
    >
      {events.map((event) => (
        <li key={event.id} className="min-w-0">
          <EventCard
            event={event}
            description={descriptionsByEventId?.[event.id] ?? undefined}
          />
        </li>
      ))}
    </ul>
  )
}
