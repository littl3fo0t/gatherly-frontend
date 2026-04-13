import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { AppSonner } from "@/components/app-sonner"
import { QueryProvider } from "@/components/query-provider"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  title: {
    default: "Gatherly",
    template: "%s | Gatherly",
  },
  description:
    "Discover community events across Canada. Browse public listings, RSVP in seconds, or host something for your community.",
  openGraph: {
    type: "website",
    siteName: "Gatherly",
    locale: "en_CA",
    title: "Gatherly",
    description:
      "Discover community events across Canada. Browse public listings, RSVP in seconds, or host something for your community.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gatherly",
    description:
      "Discover community events across Canada. Browse public listings, RSVP in seconds, or host something for your community.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-base leading-normal">
        <QueryProvider>
          {children}
          <AppSonner />
        </QueryProvider>
      </body>
    </html>
  )
}
