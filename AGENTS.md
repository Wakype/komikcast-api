# AGENTS.md

> This file guides AI coding assistants on how to work in this codebase. Read this before making any changes.

---

## Project Overview

This is a **manga scraping REST API** built with Next.js 16 App Router. It scrapes manga data (titles, chapters, images) from external websites using `cheerio` for HTML parsing and **native `fetch()`** for HTTP requests. All endpoints return clean JSON and responses are aggressively cached to stay within **Vercel Hobby Plan** limits.

It includes:
- **REST API** — The core scraping endpoints
- **API Explorer** — A premium dashboard UI at `/api` for testing endpoints
- **Legal Pages** — Terms of Service, Privacy Policy, DMCA at `/legal`
- **Cloudflare Worker Proxy** — Bypasses Cloudflare IP blocking on Vercel
- **Rate Limiting** — Per-IP rate limiting with bypass key support via `proxy.ts`

---

## Package Manager

**PNPM or NPM. No Yarn.**

```bash
pnpm install        # or: npm install
pnpm add <pkg>      # or: npm install <pkg>
pnpm add -D <pkg>   # or: npm install -D <pkg>
pnpm dev            # or: npm run dev
pnpm build          # or: npm run build
```

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Cheerio (HTML parsing)
- Native `fetch()` (HTTP requests — no axios)
- Tailwind CSS (frontend UI only)
- ESLint

---

## Project Structure

**No `src/` directory.** All folders live at the project root.

```
├── app/
│   ├── page.tsx                            # Landing page
│   ├── layout.tsx                          # Root layout (analytics, fonts)
│   ├── globals.css                         # Global styles
│   ├── api/
│   │   ├── page.tsx                        # API Explorer UI
│   │   ├── home/route.ts                   # Home data endpoint
│   │   ├── komik/[slug]/route.ts           # Manga detail endpoint
│   │   ├── komik/[slug]/[chapterId]/route.ts # Chapter images endpoint
│   │   └── proxy/route.ts                  # Image hotlink bypass proxy
│   ├── legal/
│   │   └── page.tsx                        # Terms, Privacy, DMCA
│   └── template/
│       └── page.tsx                        # Template/example page
├── cloudflare-worker/
│   └── worker.js                           # CF Worker proxy (deploy separately)
├── libs/
│   └── scraper.ts                          # fetchAPI(), fetchPage() — scraper core
├── types/
│   └── manga.ts                            # Shared TypeScript interfaces
├── utils/
│   ├── response.ts                         # ok(), err() response helpers
│   └── cache.ts                            # cacheHeader(), CACHE_TTL constants
├── proxy.ts                                # Rate limiting (Next.js proxy convention)
├── .env.example                            # Environment variable template
└── .env.local                              # Local env vars (git-ignored)
```

### Directory Responsibilities

| Directory             | Purpose                                                        |
| --------------------- | -------------------------------------------------------------- |
| `app/api/`            | Route handlers only — no business logic                        |
| `cloudflare-worker/`  | Standalone CF Worker proxy (deployed to Cloudflare, not Vercel)|
| `libs/`               | External integrations — `fetchAPI()`, `fetchPage()`            |
| `types/`              | Shared TypeScript interfaces                                   |
| `utils/`              | Pure helpers — `ok()`, `err()`, `cacheHeader()`, `CACHE_TTL`  |

Selector/scraping logic belongs in the route files, not in `libs/`.

---

## Import Alias

`@/` resolves to the **project root**. `tsconfig.json` must have:

```json
"paths": { "@/*": ["./*"] }
```

```ts
import { fetchPage } from "@/libs/scraper";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";
import { MangaItem } from "@/types/manga";
```

Never write `@/src/...` — there is no `src/` directory.

---

## API Endpoints

| Method | Endpoint                         | Description                                 | Cache TTL       |
| ------ | -------------------------------- | ------------------------------------------- | --------------- |
| GET    | `/api/home`                      | Home data (banner, popular, latest, newest) | SHORT (5 min)   |
| GET    | `/api/komik/[slug]`              | Manga detail + chapters                     | MEDIUM (30 min) |
| GET    | `/api/komik/[slug]/[chapterId]`  | Chapter images & navigation                 | STATIC (7 days) |
| GET    | `/api/proxy?url=...`             | Image hotlink bypass proxy                  | STATIC (1 year) |

All responses (except `/api/proxy` which returns raw images):

```json
{ "status": 200, "message": "Success", "data": { ... } }
```

### Rate Limiting

All API routes (except `/api/proxy`) are rate-limited via `proxy.ts`:
- **60 requests per minute** per IP
- Bypass with header: `X-API-Key: <BYPASS_SECRET>`
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Caching Rules (Critical for Vercel Hobby)

### ✅ DO: Use `cacheHeader()` on every response

```ts
import { cacheHeader, CACHE_TTL } from "@/utils/cache";

return ok(data, {
  headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
});
```

### ❌ NEVER: Add `export const dynamic = "force-dynamic"`

This disables all caching and hammers the serverless invocation limit. It is forbidden in this codebase.

---

## Scraper Architecture

The scraper uses a **two-layer proxy** system to bypass Cloudflare:

```
Vercel API → Cloudflare Worker → Target Site
```

- `libs/scraper.ts` calls the CF Worker via `SCRAPER_PROXY_URL`
- The CF Worker runs inside Cloudflare's trusted network (no IP blocking)
- If `SCRAPER_PROXY_URL` is not set, requests go directly (works locally)
- `BYPASS_SECRET` is sent as `X-Bypass-Key` header to skip CF Worker rate limits

---

## Route File Pattern

Every `route.ts` must follow this structure exactly:

```ts
import { NextRequest } from "next/server";
import { fetchPage } from "@/libs/scraper";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";

export async function GET(req: NextRequest) {
  try {
    const $ = await fetchPage("/some-path");

    // TODO: update selector — inspect target site HTML
    // scraping logic here

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e) {
    console.error("[/api/route-name]", e);
    return err("Descriptive message");
  }
}
```

---

## Coding Rules

1. **No `Response.json()` directly** — always use `ok()` or `err()` from `@/utils/response`
2. **All types from `@/types/manga`** — no inline type definitions in route files
3. **Every selector needs a `// TODO:` comment** noting it depends on the target site's HTML
4. **No `any` type** unless truly unavoidable — add a comment explaining why
5. **Always `console.error("[route-name]", e)`** inside catch blocks before returning `err()`
6. **No axios** — use native `fetch()` via `libs/scraper.ts`

---

## Environment Variables

| Variable           | Required | Description                                        |
| ------------------ | -------- | -------------------------------------------------- |
| `MANGA_BASE_URL`   | ✅       | Base URL of the target manga site                  |
| `SCRAPER_PROXY_URL`| ⚠️       | CF Worker proxy URL (required for Vercel deploy)   |
| `BYPASS_SECRET`    | ❌       | Secret key to bypass rate limiting on API & Worker |

Copy `.env.example` → `.env.local`. Restart dev server after changes.

---

## Adding a New Endpoint

1. Create `app/api/<name>/route.ts`
2. Use the route file pattern above
3. Pick the correct `CACHE_TTL` constant
4. Add `// TODO:` on every selector
5. Update the **API Endpoints** table in this file

---

## Adding a New Type

All types live in `types/manga.ts`:

- No `I` prefix (`MangaItem` not `IMangaItem`)
- Export every interface
- `string | null` for nullable fields (not `string | undefined`)

---

## Common Pitfalls

| Problem                             | Fix                                                          |
| ----------------------------------- | ------------------------------------------------------------ |
| Empty arrays from scraper           | Site HTML changed — inspect and update selectors             |
| 403 / blocked on Vercel             | Deploy CF Worker and set `SCRAPER_PROXY_URL`                 |
| 403 / blocked locally               | Update `User-Agent` in `libs/scraper.ts`                     |
| `MANGA_BASE_URL` undefined          | Check `.env.local` exists, restart dev server                |
| Every request hits the live scraper | `cacheHeader()` missing, or `force-dynamic` was added        |
| Path `@/src/...` not found          | No `src/` directory — use `@/libs/`, `@/types/`, `@/utils/`  |
| Middleware deprecation warning      | Use `proxy.ts` not `middleware.ts` (Next.js 16)              |

---

## Deployment

### Vercel
Set environment variables in Vercel → Project → Settings → Environment Variables:
- `MANGA_BASE_URL`
- `SCRAPER_PROXY_URL`
- `BYPASS_SECRET`

### Cloudflare Worker
Deploy `cloudflare-worker/worker.js` to Cloudflare Workers:
1. Create Worker at dash.cloudflare.com
2. Paste the worker code
3. Set `BYPASS_SECRET` env variable in Worker Settings → Variables
4. Note the Worker URL and set it as `SCRAPER_PROXY_URL` in Vercel

---

## Out of Scope

Do not add without explicit instruction:

- Database / ORM
- Authentication (beyond API key bypass)
- `export const dynamic = "force-dynamic"`
- A `src/` directory
