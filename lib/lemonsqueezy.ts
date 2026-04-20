import { createHmac, timingSafeEqual } from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

let setupDone = false;

export function setupLemonSqueezyClient(): void {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey || setupDone) {
    return;
  }

  lemonSqueezySetup({ apiKey });
  setupDone = true;
}

export function buildCheckoutUrl(custom: Record<string, string> = {}): string | null {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!productId) {
    return null;
  }

  const url = new URL(`https://checkout.lemonsqueezy.com/buy/${productId}`);
  url.searchParams.set("checkout[dark]", "true");
  url.searchParams.set("embed", "1");

  for (const [key, value] of Object.entries(custom)) {
    if (!value) {
      continue;
    }

    url.searchParams.set(`checkout[custom][${key}]`, value);
  }

  return url.toString();
}

export function verifyLemonWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(body).digest("hex");

  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
