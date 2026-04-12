import { cookies } from "next/headers"

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${b}${p}`
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) {
    return Response.json({ error: "missing_NEXT_PUBLIC_API_URL" }, { status: 500 })
  }

  const token = (await cookies()).get("gatherly_access_token")?.value
  if (!token) {
    return Response.json({ error: "missing_token" }, { status: 401 })
  }

  const upstreamUrl = joinUrl(base, "/profiles/me")
  const upstreamRes = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const contentType = upstreamRes.headers.get("content-type") ?? "application/json"
  const body = await upstreamRes.text()
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      "content-type": contentType,
    },
  })
}

export async function PUT(request: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) {
    return Response.json({ error: "missing_NEXT_PUBLIC_API_URL" }, { status: 500 })
  }

  const token = (await cookies()).get("gatherly_access_token")?.value
  if (!token) {
    return Response.json({ error: "missing_token" }, { status: 401 })
  }

  let bodyText: string
  try {
    bodyText = await request.text()
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 })
  }

  const upstreamUrl = joinUrl(base, "/profiles/me")
  const upstreamRes = await fetch(upstreamUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: bodyText,
    cache: "no-store",
  })

  const contentType = upstreamRes.headers.get("content-type") ?? "application/json"
  const body = await upstreamRes.text()
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      "content-type": contentType,
    },
  })
}

