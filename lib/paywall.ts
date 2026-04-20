import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "envgen_access";
const ACCESS_TTL_DAYS = 30;
const CHECKOUT_NONCE_TTL_MINUTES = 120;

type AccessPayload = {
  source: string;
  iat: number;
  exp: number;
};

type CheckoutNoncePayload = {
  jti: string;
  iat: number;
  exp: number;
};

function getSigningSecret(): string {
  const secret = process.env.PAYWALL_SECRET ?? process.env.NEXTAUTH_SECRET;
  return secret && secret.length > 0 ? secret : "dev-paywall-secret";
}

function encode(data: string): string {
  return Buffer.from(data, "utf8").toString("base64url");
}

function decode(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

export function createAccessToken(source = "checkout-success"): string {
  const iat = Date.now();
  const exp = iat + ACCESS_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload: AccessPayload = { source, iat, exp };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return false;
  }

  const expected = sign(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signaturePart);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(decode(payloadPart)) as AccessPayload;
    return Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAccessCookieConfig() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TTL_DAYS * 24 * 60 * 60
  };
}

export function createCheckoutNonce(): string {
  const iat = Date.now();
  const exp = iat + CHECKOUT_NONCE_TTL_MINUTES * 60 * 1000;
  const payload: CheckoutNoncePayload = {
    jti: randomUUID(),
    iat,
    exp
  };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyCheckoutNonce(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return false;
  }

  const expected = sign(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signaturePart);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(decode(payloadPart)) as CheckoutNoncePayload;
    return Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch {
    return false;
  }
}
