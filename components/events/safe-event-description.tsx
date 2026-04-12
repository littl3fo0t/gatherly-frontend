"use client"

import * as React from "react"

import { sanitizeEventDescription } from "@/lib/sanitize-event-description"
import { cn } from "@/lib/utils"

export type SafeEventDescriptionProps = {
  html: string
  className?: string
}

/**
 * Sanitizes API HTML with DOMPurify after mount so it never runs during SSR.
 */
export function SafeEventDescription({ html, className }: SafeEventDescriptionProps) {
  const [sanitized, setSanitized] = React.useState("")

  React.useLayoutEffect(() => {
    setSanitized(sanitizeEventDescription(html))
  }, [html])

  return (
    <div
      className={cn(
        "event-description max-w-none text-base leading-relaxed text-foreground [&_a]:text-foreground [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
