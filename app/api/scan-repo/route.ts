import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scanRepositoryForEnvVars } from "@/lib/github";
import { PAYWALL_COOKIE_NAME, hasValidPaidCookieValue } from "@/lib/paywall";

interface Body {
  repo?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const paidCookie = request.cookies.get(PAYWALL_COOKIE_NAME)?.value;
  if (!hasValidPaidCookieValue(paidCookie)) {
    return NextResponse.json({ error: "Paid access is required." }, { status: 402 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.repo || typeof body.repo !== "string") {
    return NextResponse.json({ error: "Provide a repository URL or owner/repo value." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const result = await scanRepositoryForEnvVars({
      repoInput: body.repo,
      accessToken: session?.githubAccessToken
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Repository scan failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
