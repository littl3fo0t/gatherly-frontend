import type { Metadata } from "next"

import { EventDetailView } from "@/components/events/event-detail-view"

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: "Event",
    description: `Event details on Gatherly.`,
    openGraph: {
      title: "Event",
      url: `/events/${id}`,
    },
  }
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params
  return <EventDetailView eventId={id} />
}
