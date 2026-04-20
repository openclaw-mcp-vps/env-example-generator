# Build Task: env-example-generator

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: env-example-generator
HEADLINE: Env Example Generator — scan your repo for process.env.X, generate .env.example
WHAT: Paste repo URL or connect GitHub. AI scans all files for process.env references, outputs a complete .env.example with AI-generated descriptions per var.
WHY: Most open-source projects have stale/incomplete .env.example. Automating = new contributor onboarding win. Tiny pricing wedge works for solo devs.
WHO PAYS: Open-source maintainers wanting good DX
NICHE: devtools
PRICE: $$2 one-time, $7/mo team license/mo

ARCHITECTURE SPEC:
Next.js app with GitHub OAuth integration that scans repositories for environment variables and generates .env.example files with AI-powered descriptions. Uses OpenAI API for intelligent variable descriptions and Lemon Squeezy for payment processing.

PLANNED FILES:
- pages/api/auth/[...nextauth].js
- pages/api/github/repos.js
- pages/api/scan-repo.js
- pages/api/generate-env.js
- pages/api/webhooks/lemonsqueezy.js
- components/RepoScanner.jsx
- components/EnvPreview.jsx
- components/PricingCard.jsx
- lib/github.js
- lib/env-parser.js
- lib/openai.js
- lib/lemonsqueezy.js
- pages/index.js
- pages/dashboard.js
- pages/scan/[repoId].js

DEPENDENCIES: next, react, tailwindcss, next-auth, octokit, openai, @lemonsqueezy/lemonsqueezy.js, prisma, @prisma/client, zod, react-hook-form, lucide-react

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
