import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { QueryProvider } from "@/components/query-provider"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Gatherly",
  description: "Community event platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-base leading-normal">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
