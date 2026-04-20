import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildCheckoutUrl } from "@/lib/lemonsqueezy";
import {
  ACCESS_COOKIE_NAME,
  createCheckoutNonce,
  verifyAccessToken
} from "@/lib/paywall";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const accessCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")[1];

  const hasAccess = verifyAccessToken(accessCookie);
  const checkoutNonce = createCheckoutNonce();

  const session = await getServerSession(authOptions);
  const checkoutUrl = buildCheckoutUrl({
    checkout_nonce: checkoutNonce,
    email: session?.user?.email ?? ""
  });

  return NextResponse.json({
    hasAccess,
    checkoutUrl,
    checkoutNonce
  });
}
