import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
  const baseUrl = envBase ? new URL(envBase) : null

  const now = new Date()

  function url(path: string) {
    return baseUrl ? new URL(path, baseUrl).toString() : path
  }

  return [
    {
      url: url("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ]
}

