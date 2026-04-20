import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { RepoScanner } from "@/components/RepoScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessValue = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const hasAccess = verifyAccessToken(accessValue);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#9da7b5] hover:text-[#d1d7de]">
          <ArrowLeft className="h-4 w-4" /> Back to landing
        </Link>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[#9da7b5]">
          Scan repositories, generate a complete <code>.env.example</code>, and copy results into your
          project.
        </p>
      </header>

      {hasAccess ? (
        <RepoScanner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#7ee787]" /> Feature locked
              </CardTitle>
              <CardDescription>
                Payment is required before repository scanning is enabled in this browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[#d1d7de]">
              The paywall keeps pricing sustainable for maintainers while keeping the tool cheap.
              Complete checkout, then click <strong>Unlock after payment</strong>.
            </CardContent>
          </Card>

          <PricingCard title="Unlock Scanner Access" />
        </div>
      )}
    </main>
  );
}
