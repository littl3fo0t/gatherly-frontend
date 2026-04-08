/**
 * Low-level HTTP helpers for the Spring API (NEXT_PUBLIC_API_URL).
 * Resolves paths against the base URL, parses JSON, and throws ApiError on non-2xx.
 */
type FetchJsonOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers?: Record<string, string>
  body?: unknown
  cache?: RequestCache
  signal?: AbortSignal
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${b}${p}`
}

export class ApiError extends Error {
  status: number
  url: string
  bodyText?: string

  constructor(args: { status: number; url: string; message: string; bodyText?: string }) {
    super(args.message)
    this.name = "ApiError"
    this.status = args.status
    this.url = args.url
    this.bodyText = args.bodyText
  }
}

export function getPublicApiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_URL")
  return base
}

export async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const base = getPublicApiBaseUrl()
  const url = joinUrl(base, path)

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    signal: options.signal,
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => undefined)
    throw new ApiError({
      status: res.status,
      url,
      message: `Request failed (${res.status})`,
      bodyText,
    })
  }

  return (await res.json()) as T
}

