import Link from "next/link";
import { ArrowRight, Github, ScanSearch, Sparkles, Users } from "lucide-react";
import { PricingCard } from "@/components/pricing-card";

const problems = [
  {
    title: "Stale .env.example files break first-run setup",
    description:
      "New contributors clone your repo, run install, and hit immediate runtime errors because required variables are undocumented."
  },
  {
    title: "Maintainers spend time answering the same setup questions",
    description:
      "Each release adds integrations, but docs lag behind. The support burden lands on maintainers and slows shipping."
  },
  {
    title: "Hidden env dependencies create fragile deployments",
    description:
      "Variables buried in feature flags or edge routes only fail in production when no one expected them."
  }
];

const faq = [
  {
    q: "Can it scan private repositories?",
    a: "Yes. Connect GitHub on the dashboard and the scanner uses your OAuth token to inspect repositories your account can access."
  },
  {
    q: "How are descriptions generated?",
    a: "The app sends variable names plus nearby code snippets to OpenAI and asks for maintainer-focused descriptions. If no API key is configured, it falls back to deterministic heuristics."
  },
  {
    q: "Does this replace human review?",
    a: "No. It accelerates the first draft and catches missing variables, but maintainers should still review final descriptions before commit."
  },
  {
    q: "How is paid access handled?",
    a: "After Stripe checkout, webhook-confirmed purchase emails can unlock access in-browser, and scanning APIs require a signed paid cookie."
  }
];

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-120px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-16">
        <header className="mb-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2">
              <ScanSearch className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold tracking-wide text-zinc-200">Env Example Generator</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
            >
              Open Dashboard
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Better onboarding for open-source maintainers
            </p>
            <h1 className="text-4xl font-bold leading-tight text-zinc-50 md:text-6xl">
              Ship a complete <span className="text-emerald-400">.env.example</span> in minutes, not guesswork.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Paste a GitHub URL or connect your account. We scan real source files for `process.env.*` usage,
              dedupe variables, and generate contributor-ready descriptions so your setup docs stop drifting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                Generate My .env.example
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex h-11 items-center rounded-lg border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900"
              >
                See Pricing
              </a>
            </div>
            <div className="mt-8 grid gap-4 text-sm text-zinc-300 sm:grid-cols-3">
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">No repo cloning required</p>
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">Private repo support</p>
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">AI-assisted variable docs</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl shadow-black/20">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Sample Output</p>
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-6 text-zinc-200">
{`# Generated by Env Example Generator
# Public API base URL used by browser requests.
NEXT_PUBLIC_API_URL=

# Secret used to verify webhook signatures from Stripe.
STRIPE_WEBHOOK_SECRET=

# Token used for authenticated GitHub API access.
GITHUB_TOKEN=`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          <h2 className="text-2xl font-bold text-zinc-50">The Problem This Solves</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((problem) => (
            <article key={problem.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">{problem.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{problem.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-8 text-2xl font-bold text-zinc-50">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Step 1</p>
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">Provide Repository Access</h3>
            <p className="text-sm text-zinc-300">
              Paste a public repo URL or connect GitHub to scan private codebases with your account permissions.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Step 2</p>
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">Static Scan + Deduplication</h3>
            <p className="text-sm text-zinc-300">
              The scanner traverses repo files, extracts every environment variable reference, and merges duplicates.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Step 3</p>
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">Generate Commit-Ready Output</h3>
            <p className="text-sm text-zinc-300">
              OpenAI drafts practical descriptions from usage snippets, then you copy the generated `.env.example`.
            </p>
          </article>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-4 text-center text-2xl font-bold text-zinc-50">Simple Pricing for Maintainers</h2>
        <p className="mb-8 text-center text-zinc-300">
          Pay once to unlock quickly, or choose a low monthly team license for ongoing shared maintenance.
        </p>
        <PricingCard />
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="mb-6 text-2xl font-bold text-zinc-50">FAQ</h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <article key={item.q} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="mb-2 font-semibold text-zinc-100">{item.q}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-zinc-400 md:flex-row">
          <p>Env Example Generator helps open-source maintainers ship cleaner setup docs.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-zinc-200"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/dashboard" className="hover:text-zinc-200">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
