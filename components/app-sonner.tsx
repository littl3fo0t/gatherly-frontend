"use client"

import { Toaster } from "sonner"

/** Lightweight toaster (no `next-themes` dependency). */
export function AppSonner() {
  return <Toaster richColors closeButton position="top-center" />
}
