"use client"

/**
 * Public-only “How it works” section for the landing page.
 * Kept separate so it can be gated off for authenticated users.
 */
import { CalendarPlus, Compass, Ticket } from "lucide-react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingHowItWorks() {
  return (
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
                Explore active listings—filtering and richer discovery will layer in as the product
                grows.
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
  )
}

