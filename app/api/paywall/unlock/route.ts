import { NextResponse } from "next/server";
import { z } from "zod";
import { isNoncePaid } from "@/lib/storage";
import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  getAccessCookieConfig,
  verifyCheckoutNonce
} from "@/lib/paywall";

const bodySchema = z.object({
  checkoutNonce: z.string().min(12)
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid unlock request" }, { status: 400 });
  }

  const checkoutNonce = parsed.data.checkoutNonce;

  if (!verifyCheckoutNonce(checkoutNonce)) {
    return NextResponse.json({ error: "Expired checkout token" }, { status: 400 });
  }

  const paid = await isNoncePaid(checkoutNonce);
  if (!paid) {
    return NextResponse.json(
      { error: "Payment is not confirmed yet" },
      { status: 409 }
    );
  }

  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken("lemonsqueezy"),
    getAccessCookieConfig());

  return response;
}
