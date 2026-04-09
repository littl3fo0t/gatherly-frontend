"use client"

/**
 * Public-only marketing copy for the landing hero.
 * Extracted so authenticated users can skip marketing and jump straight to product UI.
 */
export function LandingHeroMarketing() {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-lg leading-relaxed text-muted-foreground">
        Gatherly is a minimalist event board: browse what is happening near you, save your spot,
        or host something for your community. No clutter—just clear listings and straightforward
        actions.
      </p>
    </div>
  )
}

