import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCode2, Github, Sparkles, Zap } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "Will it work on private repositories?",
    answer:
      "Yes. Connect GitHub with OAuth, and the scanner will use your token to read private files with your existing repo permissions."
  },
  {
    question: "How accurate are environment variable descriptions?",
    answer:
      "Descriptions combine static code context and OpenAI analysis. You can still edit wording before committing the generated file."
  },
  {
    question: "Do you store my repository code?",
    answer:
      "No full clone is persisted. Files are streamed for scanning and only variable metadata is returned to your session."
  },
  {
    question: "Can I use it for monorepos?",
    answer:
      "Yes. The scanner walks the repository tree and finds env usage across packages and services."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between border-b border-[#263041] pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-[#2f6f3e] bg-[#132418] p-2">
            <FileCode2 className="h-5 w-5 text-[#7ee787]" />
          </div>
          <div>
            <p className="text-sm text-[#9da7b5]">devtools</p>
            <h1 className="text-lg font-semibold">Env Example Generator</h1>
          </div>
        </div>
        <Link href="/dashboard" className="text-sm text-[#7ee787] transition hover:text-[#9ff0ab]">
          Open dashboard
        </Link>
      </header>

      <section className="grid gap-8 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <div className="mb-5 inline-flex items-center rounded-full border border-[#2f6f3e] bg-[#132418] px-3 py-1 text-xs font-medium text-[#7ee787]">
            onboarding DX for open-source maintainers
          </div>
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Scan your repo, detect every <code className="text-[#7ee787]">process.env.*</code>,
            and publish a complete <code className="text-[#7ee787]">.env.example</code> in minutes.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#9da7b5]">
            Most contributor setup failures happen because environment variables are missing or
            undocumented. This tool reads your codebase, finds every referenced key, and writes a
            practical <code>.env.example</code> with AI-generated descriptions so new contributors can
            run your project without guesswork.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg">
                Generate my .env.example <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center rounded-md border border-[#263041] px-4 py-2 text-sm text-[#d1d7de] transition hover:bg-[#161b22]"
            >
              View pricing
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What maintainers fix first</CardTitle>
            <CardDescription>
              Faster first contribution flow, fewer setup questions, and cleaner issue triage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#d1d7de]">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3fb950]" />
              <p>Catch stale keys before release and avoid broken README setup docs.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3fb950]" />
              <p>Generate consistent variable descriptions for internal and external contributors.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3fb950]" />
              <p>Support public and private repos through GitHub OAuth permissions.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 pb-14 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Github className="h-4 w-4 text-[#7ee787]" /> 1) Connect or paste URL
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#9da7b5]">
            Paste <code>owner/repo</code> for public repos or connect GitHub to scan private code.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-[#7ee787]" /> 2) Scan all env usages
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#9da7b5]">
            We inspect source files for direct and bracketed <code>process.env</code> references.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-[#7ee787]" /> 3) Generate and copy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#9da7b5]">
            AI writes short descriptions and outputs a complete <code>.env.example</code> ready for
            commit.
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="grid gap-8 border-y border-[#263041] py-14 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold">Simple pricing for maintainers and small teams</h3>
          <p className="max-w-lg text-sm leading-7 text-[#9da7b5]">
            This is a niche DX tool with a tiny wedge price: cheap enough for solo maintainers,
            predictable for teams running many repos.
          </p>
          <ul className="space-y-2 text-sm text-[#d1d7de]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> $2 one-time personal license
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> $7/mo team license
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> Unlimited scans and generation
            </li>
          </ul>
        </div>
        <PricingCard compact />
      </section>

      <section className="py-14">
        <h3 className="mb-6 text-2xl font-semibold">FAQ</h3>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-[#263041] bg-[#111827] p-4"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-[#d1d7de]">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-[#9da7b5]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
