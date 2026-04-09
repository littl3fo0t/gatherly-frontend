import type { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"

import { HomePublicEvents, HomePublicEventsSkeleton } from "@/components/home/home-public-events"
import { LandingHeroCtas } from "@/components/home/landing-hero-ctas"
import { LandingMarketingGate } from "@/components/home/landing-marketing-gate"
import { AppShell } from "@/components/app-shell"

async function getRequestOriginAsync(): Promise<string | null> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  if (!host) return null
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

export async function generateMetadata(): Promise<Metadata> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
  const origin = envBase || (await getRequestOriginAsync())
  const canonical = origin ? new URL("/", origin).toString() : "/"

  const title = "Community events across Canada"
  const description =
    "Gatherly is a minimalist event board: browse what is happening near you, RSVP in seconds, or host something for your community."

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: "/",
    },
    twitter: {
      title,
      description,
    },
  }
}

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
