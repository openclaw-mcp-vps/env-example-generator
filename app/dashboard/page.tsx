import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { Github, Lock, ScanSearch } from "lucide-react";
import { authOptions, isGithubAuthConfigured } from "@/lib/auth";
import { PAYWALL_COOKIE_NAME, hasValidPaidCookieValue } from "@/lib/paywall";
import { PricingCard } from "@/components/pricing-card";
import { RepoScanner } from "@/components/repo-scanner";
import { UnlockForm } from "@/components/unlock-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const paidCookie = cookieStore.get(PAYWALL_COOKIE_NAME)?.value;
  const isPaid = hasValidPaidCookieValue(paidCookie);
  const githubConnected = Boolean(session?.githubAccessToken);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2">
            <ScanSearch className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
            <p className="text-sm text-zinc-400">Scan repos and generate an accurate .env.example file.</p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
        >
          Back to Landing
        </Link>
      </header>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5 text-zinc-300" />
              GitHub Connection
            </CardTitle>
            <CardDescription>
              Connect GitHub for private repo access and faster repo selection from your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!isGithubAuthConfigured ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                GitHub OAuth is not configured yet. Add `GITHUB_ID` and `GITHUB_SECRET` in your environment.
              </p>
            ) : githubConnected ? (
              <>
                <p className="text-zinc-200">
                  Connected as <span className="font-semibold">@{session?.user?.login ?? session?.user?.name}</span>
                </p>
                <a
                  href="/api/auth/signout?callbackUrl=/dashboard"
                  className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 font-semibold text-zinc-100 hover:bg-zinc-900"
                >
                  Disconnect GitHub
                </a>
              </>
            ) : (
              <a
                href="/api/auth/signin/github?callbackUrl=/dashboard"
                className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 font-semibold text-zinc-100 hover:bg-zinc-900"
              >
                Connect GitHub
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-zinc-300" />
              Access Status
            </CardTitle>
            <CardDescription>
              Scanning APIs are protected by a signed browser cookie set after purchase verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                Paid access is active in this browser.
              </p>
            ) : (
              <p className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300">
                Buy access, then verify using the purchase email to unlock the scanner.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {isPaid ? (
        <RepoScanner githubConnected={githubConnected} githubLogin={session?.user?.login} />
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <PricingCard />
          <Card>
            <CardHeader>
              <CardTitle>Unlock This Browser</CardTitle>
              <CardDescription>
                Enter the same email used in Stripe checkout. The server validates it from webhook events, then sets
                a signed cookie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnlockForm />
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
