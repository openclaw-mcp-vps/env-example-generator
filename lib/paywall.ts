import crypto from "node:crypto";

export const PAYWALL_COOKIE_NAME = "envgen_paid";

function getPaywallSecret(): string {
  return process.env.PAYWALL_COOKIE_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-paywall-secret";
}

export function createPaidCookieValue(email: string): string {
  const normalized = email.trim().toLowerCase();
  const signature = crypto
    .createHmac("sha256", getPaywallSecret())
    .update(normalized)
    .digest("hex");

  return `${normalized}.${signature}`;
}

export function hasValidPaidCookieValue(value?: string): boolean {
  if (!value || !value.includes(".")) {
    return false;
  }

  const [email, providedSignature] = value.split(".");
  if (!email || !providedSignature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getPaywallSecret())
    .update(email)
    .digest("hex");

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
