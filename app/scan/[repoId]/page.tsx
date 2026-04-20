import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { RepoScanner } from "@/components/RepoScanner";
import { PricingCard } from "@/components/PricingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

type ScanPageProps = {
  params: Promise<{ repoId: string }>;
};

function decodeRepoId(repoId: string): string {
  return repoId.replace("__", "/");
}

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: ScanPageProps) {
  const resolvedParams = await params;
  const repo = decodeRepoId(resolvedParams.repoId);

  const cookieStore = await cookies();
  const accessValue = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const hasAccess = verifyAccessToken(accessValue);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#9da7b5] hover:text-[#d1d7de]">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Scan {repo}</h1>
        <p className="text-sm text-[#9da7b5]">
          Repo-focused scanner view with prefilled repository reference.
        </p>
      </header>

      {hasAccess ? (
        <RepoScanner initialRepo={repo} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Scanner access required</CardTitle>
              <CardDescription>
                Complete checkout to run scans and generate AI-backed env descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[#d1d7de]">
              Once payment is confirmed by webhook, this page unlocks automatically.
            </CardContent>
          </Card>
          <PricingCard />
        </div>
      )}
    </main>
  );
}
