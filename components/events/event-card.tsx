import Link from "next/link"
import {
  Calendar,
  Clock,
  Eye,
  Flame,
  ImageIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatEventListDate, formatEventListTimeRange } from "@/lib/format-event-list"
import type { PublicEventListItem } from "@/lib/api/public-types"
import { cn } from "@/lib/utils"

function eventTypeLabel(type: PublicEventListItem["eventType"]): string {
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
  admissionType: PublicEventListItem["admissionType"],
  admissionFee: PublicEventListItem["admissionFee"],
): string {
  if (admissionType === "free") return "Free"
  if (admissionFee != null) {
    return `Paid · $${admissionFee.toFixed(2)} CAD`
  }
  return "Paid"
}

export type EventCardProps = {
  event: PublicEventListItem
  /** Optional preview text (public list API omits this; dashboard may supply it). */
  description?: string | null
  /** Link target for “View event”. Defaults to `/events/{id}`. */
  href?: string
  className?: string
}

export function EventCard({ event, description, href, className }: EventCardProps) {
  const detailHref = href ?? `/events/${event.id}`
  const dateLine = formatEventListDate(event.startTime, event.timezone)
  const timeLine = formatEventListTimeRange(event.startTime, event.endTime, event.timezone)

  const categoryBadges = event.categories.slice(0, 3)

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-0 overflow-hidden p-0 ring-1 ring-foreground/10",
        className,
      )}
    >
      <div className="relative aspect-video w-full shrink-0 bg-muted">
        {event.coverImageUrl ? (
          // Remote CDN URLs (e.g. Cloudinary); next/image would require remotePatterns per host.
          // eslint-disable-next-line @next/next/no-img-element -- see above
          <img
            src={event.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-muted-foreground"
            role="img"
            aria-label="No cover image"
          >
            <ImageIcon className="size-10 stroke-1" aria-hidden />
          </div>
        )}
        {event.isHot ? (
          <div className="absolute left-2 top-2">
            <Badge variant="outline" className="border-foreground/20 bg-background/90 text-foreground">
              <Flame className="size-3" aria-hidden />
              Hot
            </Badge>
          </div>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-2">
        <h3 className="text-base font-semibold leading-snug text-foreground">{event.title}</h3>

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

        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{admissionLabel(event.admissionType, event.admissionFee)}</Badge>
          <Badge variant="outline">{eventTypeLabel(event.eventType)}</Badge>
          {categoryBadges.map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-3 border-t-0 bg-muted/30 px-4 py-4">
        <Separator />
        <Button variant="default" size="default" className="w-full" asChild>
          <Link href={detailHref}>
            <Eye data-icon="inline-start" className="size-4" aria-hidden />
            View event
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
