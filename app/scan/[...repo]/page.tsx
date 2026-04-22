import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { RepoScanner } from "@/components/repo-scanner";
import { authOptions } from "@/lib/auth";
import { PAYWALL_COOKIE_NAME, hasValidPaidCookieValue } from "@/lib/paywall";

interface ScanPageProps {
  params: Promise<{ repo: string[] }>;
}

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: ScanPageProps) {
  const [{ repo }, session, cookieStore] = await Promise.all([params, getServerSession(authOptions), cookies()]);

  const paidCookie = cookieStore.get(PAYWALL_COOKIE_NAME)?.value;
  if (!hasValidPaidCookieValue(paidCookie)) {
    redirect("/dashboard");
  }

  const initialRepo = decodeURIComponent(repo.join("/"));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <RepoScanner
        githubConnected={Boolean(session?.githubAccessToken)}
        githubLogin={session?.user?.login}
        initialRepo={initialRepo}
      />
    </main>
  );
}
