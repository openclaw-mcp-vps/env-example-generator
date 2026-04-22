import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listUserRepos } from "@/lib/github";
import { PAYWALL_COOKIE_NAME, hasValidPaidCookieValue } from "@/lib/paywall";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const paidCookie = request.cookies.get(PAYWALL_COOKIE_NAME)?.value;
  if (!hasValidPaidCookieValue(paidCookie)) {
    return NextResponse.json({ error: "Paid access is required." }, { status: 402 });
  }

  const session = await getServerSession(authOptions);
  const token = session?.githubAccessToken;

  if (!token) {
    return NextResponse.json({ error: "Connect GitHub first." }, { status: 401 });
  }

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: "Unable to fetch repositories from GitHub." }, { status: 500 });
  }
}
