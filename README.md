# Env Example Generator

Generate complete `.env.example` files by scanning `process.env.*` usage across GitHub repositories.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- NextAuth (GitHub OAuth)
- OpenAI API for variable descriptions
- Lemon Squeezy checkout overlay and webhook-backed paywall cookie

## Local setup

1. Copy `.env.example` values into `.env.local`.
2. Install deps: `npm install`
3. Start dev server: `npm run dev`

## Key routes

- `/` landing page with pricing + FAQ
- `/dashboard` paywalled tool
- `/scan/[repoId]` prefilled scanner view
- `/api/health` healthcheck

## Payment flow

1. Checkout link is generated with a signed nonce.
2. Lemon webhook confirms payment and marks nonce as paid.
3. Client calls unlock endpoint and receives signed access cookie.
4. Scan and generation APIs require that cookie.
