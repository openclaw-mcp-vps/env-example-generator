import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { scanRepositoryForEnvironmentVariables } from "@/lib/github";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

const scanSchema = z.object({
  repo: z.string().min(3)
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const accessCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!verifyAccessToken(accessCookie)) {
    return NextResponse.json(
      { error: "Payment required before scanning repositories." },
      { status: 402 }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = scanSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid repository input" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  try {
    const result = await scanRepositoryForEnvironmentVariables(parsed.data.repo, token);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Scan failed. Ensure the repo exists and GitHub auth is connected for private repos.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
