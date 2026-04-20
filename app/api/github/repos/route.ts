import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listRepositories } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "GitHub auth required" }, { status: 401 });
  }

  try {
    const repos = await listRepositories(accessToken);
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repositories from GitHub" },
      { status: 500 }
    );
  }
}
