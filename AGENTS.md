# AGENTS.md

> This file guides AI coding assistants on how to work in this codebase. Read this before making any changes.

---

## Project Overview

This is a **manga scraping REST API** built with Next.js App Router. It scrapes manga data (titles, chapters, images) from external websites using `axios` + `cheerio`, exposes clean JSON endpoints, and caches responses to stay within **Vercel Hobby Plan** limits. 

It includes a simple but modern **Frontend UI** exclusively for API Documentation (Swagger/Dashboard style) and legal pages, but the core focus remains the scraping API.

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

- Next.js (App Router)
- TypeScript (strict mode)
- Axios + Cheerio (scraping)
- ESLint

---

## Project Structure

**No `src/` directory.** All folders live at the project root.

```
├── app/
│   └── api/
│       ├── manga/route.ts
│       ├── manga/[slug]/route.ts
│       ├── manga/chapter/[chapterId]/route.ts
│       ├── genre/route.ts
│       ├── genre/[slug]/route.ts
│       ├── latest/route.ts
│       ├── popular/route.ts
│       └── search/route.ts
├── libs/
│   └── scraper.ts
├── types/
│   └── manga.ts
└── utils/
    ├── response.ts
    └── cache.ts
```

### Directory Responsibilities

| Directory  | Purpose                                                      |
| ---------- | ------------------------------------------------------------ |
| `app/api/` | Route handlers only — no business logic                      |
| `libs/`    | External integrations — axios instance, `fetchPage()`        |
| `types/`   | Shared TypeScript interfaces                                 |
| `utils/`   | Pure helpers — `ok()`, `err()`, `cacheHeader()`, `CACHE_TTL` |

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

| Method | Endpoint                         | Description                                      | Cache TTL       |
| ------ | -------------------------------- | ------------------------------------------------ | --------------- |
| GET    | `/api/home`                      | Home data (banner, popular, latest, newest)      | SHORT (5 min)   |
| GET    | `/api/komik/[slug]`              | Manga detail + chapters                          | MEDIUM (30 min) |
| GET    | `/api/komik/[slug]/[chapterId]`  | Chapter images & navigation                      | STATIC (7 days) |
| GET    | `/api/proxy?url=...`             | Image hotlink bypass proxy                       | STATIC (1 year) |

All responses (except `/api/proxy` which returns raw images):

```json
{ "status": 200, "message": "Success", "data": { ... } }
```

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
4. **All list endpoints support `?page=N`** and return `PaginatedResponse<T>`
5. **No `any` type** unless truly unavoidable — add a comment explaining why
6. **Always `console.error("[route-name]", e)`** inside catch blocks before returning `err()`

---

## Environment Variables

| Variable         | Required | Description                       |
| ---------------- | -------- | --------------------------------- |
| `MANGA_BASE_URL` | ✅       | Base URL of the target manga site |

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

| Problem                             | Fix                                                         |
| ----------------------------------- | ----------------------------------------------------------- |
| Empty arrays from scraper           | Site HTML changed — inspect and update selectors            |
| 403 / blocked                       | Update `User-Agent` in `libs/scraper.ts`                    |
| `MANGA_BASE_URL` undefined          | Check `.env.local` exists, restart dev server               |
| Every request hits the live scraper | `cacheHeader()` missing, or `force-dynamic` was added       |
| Path `@/src/...` not found          | No `src/` directory — use `@/libs/`, `@/types/`, `@/utils/` |

<!-- ---

## Deployment (Vercel)

Set `MANGA_BASE_URL` in Vercel → Project → Settings → Environment Variables. No other config needed. -->

---

## Out of Scope

Do not add without explicit instruction:

- Database / ORM
- Authentication
- `export const dynamic = "force-dynamic"`
- A `src/` directory
