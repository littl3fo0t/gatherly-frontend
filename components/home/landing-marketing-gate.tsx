"use client"

import { LandingHeroMarketing } from "@/components/home/landing-hero-marketing"
import { LandingHowItWorks } from "@/components/home/landing-how-it-works"
import { useAuthState } from "@/components/home/use-auth-state"

/**
 * Landing marketing should only show to guests.
 * Authenticated users don’t need funnel content—this gate prevents rendering it.
 */
export function LandingMarketingGate() {
  const auth = useAuthState()

  if (auth !== "out") {
    return (
      <h1 id="home-hero-heading" className="sr-only">
        Discover community events across Canada 🍁
      </h1>
    )
  }

  return (
    <>
      <div className="max-w-2xl space-y-4">
        <h1
          id="home-hero-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Discover community events across Canada 🍁
        </h1>
      </div>
      <LandingHeroMarketing />
      <LandingHowItWorks />
    </>
  )
}

