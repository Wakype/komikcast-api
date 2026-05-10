<div align="center">

# 📚 Komikcast API

**A fast, free, and open-source REST API for manga data**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Cloudflare Workers](https://img.shields.io/badge/Proxy-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

[Live Demo](https://komikcast-api-six.vercel.app) · [API Explorer](https://komikcast-api-six.vercel.app/api) · [Report Bug](https://github.com/Wakype/komikcast-api/issues)

</div>

## ✨ Features

- 🚀 **Blazing Fast** — Responses are aggressively cached on Vercel's Edge Network (5 min to 7 days)
- 🔑 **API Key Support** — Your own apps get unlimited access with a secret bypass key
- 🛡️ **Rate Limited** — Built-in per-IP rate limiting (60 req/min) to prevent abuse
- 🖼️ **Image Proxy** — Built-in proxy to bypass hotlinking and CORS restrictions
- 📖 **Interactive Docs** — API Explorer dashboard at `/api`
- 🌐 **Cloudflare Bypass** — CF Worker proxy to avoid 403 blocks on serverless platforms
- 📦 **Self-Hostable** — Clone it, set your env vars, and deploy your own instance

## 📦 API Endpoints

Base URL: `https://your-deployment.vercel.app`

| Method | Endpoint                      | Description                                       | Cache  |
| ------ | ----------------------------- | ------------------------------------------------- | ------ |
| `GET`  | `/api/home`                   | Home data — banner, popular, latest, newest manga | 5 min  |
| `GET`  | `/api/komik/:slug`            | Manga detail — synopsis, genres, chapter list     | 30 min |
| `GET`  | `/api/komik/:slug/:chapterId` | Chapter images & prev/next navigation             | 7 days |
| `GET`  | `/api/proxy?url=...`          | Image proxy — bypasses hotlinking restrictions    | 1 year |

### Response Format

All endpoints return structured JSON:

```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

### Rate Limiting

| Header                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `X-RateLimit-Limit`     | Maximum requests per window (60)         |
| `X-RateLimit-Remaining` | Remaining requests in current window     |
| `Retry-After`           | Seconds until rate limit resets (on 429) |

**Bypass rate limit** by sending your secret API key:

```
X-API-Key: your-secret-key
```

---

## 🛠️ Tech Stack

| Component | Technology                                                       |
| --------- | ---------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router)                    |
| Language  | TypeScript                                                       |
| Scraping  | [Cheerio](https://cheerio.js.org) + native `fetch()`             |
| Proxy     | [Cloudflare Workers](https://workers.cloudflare.com) (free tier) |
| Styling   | Tailwind CSS                                                     |
| Analytics | Vercel Analytics + Speed Insights                                |

---

## 🚀 Self-Hosting Guide

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io) or npm
- A [Vercel](https://vercel.com) account (free)
- A [Cloudflare](https://cloudflare.com) account (free)

### 1. Clone & Install

```bash
git clone https://github.com/Wakype/komikcast-api.git
cd komikcast-api
pnpm install # or npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Target manga site URL
MANGA_BASE_URL=https://be.komikcast.cc/

# Required for Vercel deploy: Your CF Worker proxy URL
SCRAPER_PROXY_URL=https://your-worker.your-subdomain.workers.dev

# Optional: Secret key for rate limit bypass
BYPASS_SECRET=your-super-secret-key
```

### 3. Deploy Cloudflare Worker

The Vercel deployment needs a Cloudflare Worker to bypass Cloudflare's IP blocking. The worker code is at `cloudflare-worker/worker.js`.

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create Worker**
2. Name it (e.g., `komikcast-proxy`) → click **Deploy**
3. Click **Edit Code** → paste the contents of `cloudflare-worker/worker.js`
4. In Worker **Settings → Variables**, add: `BYPASS_SECRET` = same value as your `.env.local`
5. Click **Deploy**
6. Copy the Worker URL and set it as `SCRAPER_PROXY_URL` in your Vercel environment

### 4. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, or [http://localhost:3000/api](http://localhost:3000/api) for the API Explorer.

### 5. Deploy to Vercel

```bash
# Push to GitHub, then import in Vercel
# Or use Vercel CLI:
npx vercel
```

Set environment variables in **Vercel → Project → Settings → Environment Variables**.

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Your Frontend  │────→│   Vercel API     │────→│  CF Worker     │────→ Target Site
│   + X-API-Key    │     │  (Next.js)       │     │  (Proxy)       │     (komikcast)
│                  │     │  Rate Limiter    │     │  Trusted IPs   │
└──────────────────┘     └──────────────────┘     └────────────────┘
                               ↑
                          Random Users
                         (rate limited)
```

**Why Cloudflare Worker?** Vercel's serverless functions run on datacenter IPs that Cloudflare actively blocks. By routing requests through a CF Worker (which runs inside Cloudflare's own network), the requests are treated as trusted.

---

## 📁 Project Structure

```
komikcast-api/
├── app/
│   ├── api/               # API endpoints + Explorer UI
│   ├── legal/             # Legal pages (Terms, Privacy, DMCA)
│   └── page.tsx           # Landing page
├── cloudflare-worker/     # CF Worker proxy (deploy separately)
├── libs/                  # Scraper core (fetchAPI, fetchPage)
├── types/                 # TypeScript interfaces
├── utils/                 # Response helpers, cache utilities
├── proxy.ts               # Rate limiting (Next.js proxy convention)
├── .env.example           # Environment variable template
└── AGENTS.md              # AI coding assistant guide
```

---

## ⚠️ Legal Disclaimer

This API is provided for **educational purposes and personal projects only**. The creator is not responsible for how you use the data. We do not host any manga, images, or copyrighted content. All content belongs to their respective copyright holders.

---

## 📝 License

MIT License

Made with ❤️ by [waky.dev](https://github.com/Wakype)
