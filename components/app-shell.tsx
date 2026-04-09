import type { ReactNode } from "react"

import { AppFooter } from "@/components/app-footer"
import { AppHeader } from "@/components/app-header"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main id="main-content" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
