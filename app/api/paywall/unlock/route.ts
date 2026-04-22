import { NextRequest, NextResponse } from "next/server";
import { createPaidCookieValue, PAYWALL_COOKIE_NAME } from "@/lib/paywall";
import { hasPaidEmail } from "@/lib/paywall-store";

interface Body {
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const paid = await hasPaidEmail(email);
  if (!paid) {
    return NextResponse.json(
      {
        error:
          "No completed Stripe purchase found for this email yet. Confirm the checkout succeeded and webhook delivery is configured."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ unlocked: true });
  response.cookies.set(PAYWALL_COOKIE_NAME, createPaidCookieValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
