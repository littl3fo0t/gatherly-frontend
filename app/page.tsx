import { Suspense } from "react"
import {
  CalendarPlus,
  Compass,
  Ticket,
} from "lucide-react"

import { HomePublicEvents, HomePublicEventsSkeleton } from "@/components/home/home-public-events"
import { LandingHeroCtas } from "@/components/home/landing-hero-ctas"
import { AppShell } from "@/components/app-shell"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-16 pb-4">
        <section className="flex flex-col gap-6" aria-labelledby="home-hero-heading">
          <div className="max-w-2xl space-y-4">
            <h1
              id="home-hero-heading"
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Discover community events across Canada 🍁
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Gatherly is a minimalist event board: browse what is happening near you, save your
              spot, or host something for your community. No clutter—just clear listings and
              straightforward actions.
            </p>
          </div>
          <LandingHeroCtas />
        </section>

        <section className="space-y-6" aria-labelledby="how-it-works-heading">
          <div className="max-w-2xl space-y-2">
            <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Three steps from browsing to hosting.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            <li>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                    <Compass className="size-5 text-foreground" aria-hidden />
                  </div>
                  <CardTitle className="text-base">Discover</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Explore active listings—filtering and richer discovery will layer in as the
                    product grows.
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
            <li>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                    <Ticket className="size-5 text-foreground" aria-hidden />
                  </div>
                  <CardTitle className="text-base">RSVP</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Sign in, claim your seat before capacity fills, and keep track of what you are
                    attending.
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
            <li>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                    <CalendarPlus className="size-5 text-foreground" aria-hidden />
                  </div>
                  <CardTitle className="text-base">Host</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Create in-person, virtual, or hybrid events with clear admission and location
                    rules—managed from your dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          </ul>
        </section>

        <section
          id="events"
          className="scroll-mt-24 space-y-4 rounded-xl border border-border bg-muted/20 p-6 ring-1 ring-foreground/5"
          aria-labelledby="events-heading"
        >
          <div className="space-y-1">
            <h2 id="events-heading" className="text-xl font-semibold tracking-tight">
              Events
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Active public listings from the community. Sign in from the header to RSVP or host
              your own.
            </p>
          </div>
          <Suspense fallback={<HomePublicEventsSkeleton />}>
            <HomePublicEvents />
          </Suspense>
        </section>
      </div>
    </AppShell>
  )
}
