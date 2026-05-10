# Komikcast Unofficial API

![Banner](https://via.placeholder.com/1200x400/0a0a0a/ffffff?text=Komikcast+Unofficial+API)

A powerful REST API for fetching manga data, chapters, and images from Komikcast. Built with Next.js App Router, Cheerio, and highly optimized for performance via Edge Caching.

## 🚀 Features

- **Blazing Fast**: Responses are heavily cached using Vercel's Edge Network to ensure fast delivery.
- **RESTful Design**: Clean and intuitive endpoints returning structured JSON data.
- **Image Hotlink Bypass**: Built-in image proxy to bypass Cloudflare protection and hotlinking restrictions.
- **Strictly Typed**: Built with TypeScript for reliable data structures.
- **Interactive Documentation**: Comes with a built-in API explorer dashboard.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Scraping**: `axios` + `cheerio`
- **Styling**: Tailwind CSS (for API Documentation UI)
- **Language**: TypeScript

## 📦 API Endpoints

The API base URL is wherever the app is hosted (e.g., `http://localhost:3000`).

| Method | Endpoint                         | Description                                      | Cache TTL       |
| ------ | -------------------------------- | ------------------------------------------------ | --------------- |
| GET    | `/api/home`                      | Home data (banner, popular, latest, newest)      | SHORT (5 min)   |
| GET    | `/api/komik/[slug]`              | Manga detail + chapters                          | MEDIUM (30 min) |
| GET    | `/api/komik/[slug]/[chapterId]`  | Chapter images & navigation                      | STATIC (7 days) |
| GET    | `/api/proxy?url=...`             | Image hotlink bypass proxy                       | STATIC (1 year) |

### Example Response (`/api/home`)
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "banner": [...],
    "popular": [...],
    "latest": [...],
    "newest": [...]
  }
}
```

## 💻 Running Locally

1. Clone this repository
```bash
git clone https://github.com/Wakype/komikcast-api.git
cd komikcast-api
```

2. Install dependencies using PNPM
```bash
pnpm install
```

3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add the target URL.
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to see the interactive documentation.

## ⚠️ Legal Disclaimer

This API is strictly provided for **educational purposes and personal projects**. The creator of this API is not responsible for how you use the data returned by this API. We do not host any of the manga, images, or content provided. All content belongs to their respective copyright holders.

## 📝 License

Made with ❤️ by [waky.dev](https://github.com/Wakype).
