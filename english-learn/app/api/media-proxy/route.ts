import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedHostSuffixes = [
  "archive.org",
  "html5.stanford.edu",
  "see.stanford.edu",
  "media.podcasts.ox.ac.uk",
  "podcasts.ox.ac.uk",
  "ocw.mit.edu",
  "www.ocw.mit.edu",
  "i.ytimg.com",
  "img.youtube.com",
  "images.ted.com",
  "pi.tedcdn.com",
  "www.asme.org",
  "asme.org",
  "media.nature.com",
  "nature.com",
];

function isAllowedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return allowedHostSuffixes.some(
    (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`),
  );
}

function buildErrorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function copyUpstreamHeaders(upstream: Response) {
  const headers = new Headers();

  for (const key of [
    "accept-ranges",
    "cache-control",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "last-modified",
  ]) {
    const value = upstream.headers.get(key);

    if (value) {
      headers.set(key, value);
    }
  }

  if (!headers.has("cache-control")) {
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  }

  return headers;
}

async function proxyRequest(request: NextRequest, method: "GET" | "HEAD") {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return buildErrorResponse("Missing url parameter.", 400);
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return buildErrorResponse("Invalid url parameter.", 400);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return buildErrorResponse("Unsupported url protocol.", 400);
  }

  if (!isAllowedHostname(parsed.hostname)) {
    return buildErrorResponse("Host is not allowed.", 403);
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");

  if (range) {
    upstreamHeaders.set("Range", range);
  }

  const upstream = await fetch(parsed.toString(), {
    method,
    headers: upstreamHeaders,
    redirect: "follow",
  });

  let finalHostname = parsed.hostname;

  try {
    finalHostname = new URL(upstream.url).hostname;
  } catch {
    finalHostname = parsed.hostname;
  }

  if (!isAllowedHostname(finalHostname)) {
    return buildErrorResponse("Redirect target is not allowed.", 403);
  }

  const headers = copyUpstreamHeaders(upstream);

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request, "HEAD");
}
