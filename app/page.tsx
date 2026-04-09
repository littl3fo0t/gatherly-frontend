import { Suspense } from "react"

import { HomePublicEvents, HomePublicEventsSkeleton } from "@/components/home/home-public-events"
import { LandingHeroCtas } from "@/components/home/landing-hero-ctas"
import { LandingMarketingGate } from "@/components/home/landing-marketing-gate"
import { AppShell } from "@/components/app-shell"

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-16 pb-4">
        <section className="flex flex-col gap-6" aria-labelledby="home-hero-heading">
          {/* Guest-only: hero marketing + “How it works” are gated off for signed-in users. */}
          <LandingMarketingGate />
          <LandingHeroCtas />
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
