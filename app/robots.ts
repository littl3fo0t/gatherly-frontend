import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
  const baseUrl = envBase ? new URL(envBase) : null

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/auth",
          "/api",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: baseUrl ? new URL("/sitemap.xml", baseUrl).toString() : undefined,
  }
}

