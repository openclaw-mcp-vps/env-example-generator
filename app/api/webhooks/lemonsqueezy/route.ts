import { NextResponse } from "next/server";
import { markNonceAsPaid, saveWebhookEvent } from "@/lib/storage";
import {
  setupLemonSqueezyClient,
  verifyLemonWebhookSignature
} from "@/lib/lemonsqueezy";
import { verifyCheckoutNonce } from "@/lib/paywall";

const PAID_EVENTS = new Set([
  "order_created",
  "subscription_created",
  "subscription_payment_success"
]);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  setupLemonSqueezyClient();

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    data?: { id?: string };
    meta?: {
      event_name?: string;
      custom_data?: Record<string, string>;
    };
  };

  const eventName = payload.meta?.event_name ?? "unknown";
  const orderId = payload.data?.id ?? "unknown";

  await saveWebhookEvent({
    id: orderId,
    eventName,
    receivedAt: new Date().toISOString(),
    payload
  });

  const checkoutNonce = payload.meta?.custom_data?.checkout_nonce;

  if (
    checkoutNonce &&
    PAID_EVENTS.has(eventName) &&
    verifyCheckoutNonce(checkoutNonce)
  ) {
    await markNonceAsPaid(checkoutNonce, orderId);
  }

  return NextResponse.json({ status: "ok" });
}
