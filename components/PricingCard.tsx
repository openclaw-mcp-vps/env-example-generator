"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (config: {
        eventHandler?: (event: { event: string; data?: unknown }) => void;
      }) => void;
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

type PaywallStatus = {
  hasAccess: boolean;
  checkoutUrl: string | null;
  checkoutNonce: string;
};

type PricingCardProps = {
  title?: string;
  compact?: boolean;
  onUnlocked?: () => void;
};

export function PricingCard({
  title = "Unlock Env Example Generator",
  compact = false,
  onUnlocked
}: PricingCardProps) {
  const [status, setStatus] = useState<PaywallStatus | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const planLines = useMemo(
    () => [
      "$2 one-time personal access",
      "$7/mo team license",
      "Unlimited repository scans",
      "AI descriptions for each env key"
    ],
    []
  );

  const refreshStatus = useCallback(async () => {
    const response = await fetch("/api/paywall/status", { cache: "no-store" });
    const payload = (await response.json()) as PaywallStatus;
    setStatus(payload);
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const scriptId = "lemonsqueezy-overlay";

    if (document.getElementById(scriptId)) {
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    script.onload = () => {
      window.createLemonSqueezy?.();
      window.LemonSqueezy?.Setup({
        eventHandler: (event) => {
          if (event.event === "Checkout.Success") {
            void unlockAfterCheckout();
          }
        }
      });
    };

    document.body.appendChild(script);
  }, [status]);

  async function unlockAfterCheckout() {
    if (!status) {
      return;
    }

    setIsUnlocking(true);
    setMessage("Finalizing payment access...");

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await fetch("/api/paywall/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutNonce: status.checkoutNonce })
      });

      if (response.ok) {
        setMessage("Access unlocked. Refreshing tool...");
        await refreshStatus();
        onUnlocked?.();
        setIsUnlocking(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setMessage(
      "Payment completed, but webhook confirmation is still processing. Please wait 10 seconds and try Unlock again."
    );
    setIsUnlocking(false);
  }

  async function handleCheckoutOpen() {
    if (!status?.checkoutUrl) {
      setMessage(
        "Checkout is not configured. Add NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID to enable payment."
      );
      return;
    }

    setIsOpening(true);
    setMessage(null);

    try {
      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(status.checkoutUrl);
      } else {
        window.open(status.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsOpening(false);
    }
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-[#9da7b5]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading pricing...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.hasAccess) {
    return (
      <Card className="border-[#2f6f3e]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-[#7ee787]">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">Access active for this browser session.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? "" : "max-w-xl"}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>
          Ship better onboarding docs with one command-generated <code>.env.example</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[#2f6f3e] bg-[#132418] p-4">
          <p className="text-2xl font-semibold text-[#7ee787]">$2 once</p>
          <p className="mt-1 text-sm text-[#9fd6ad]">Solo maintainer license</p>
        </div>
        <div className="rounded-lg border border-[#263041] bg-[#0d1117] p-4">
          <p className="text-2xl font-semibold text-[#80d7ff]">$7 / month</p>
          <p className="mt-1 text-sm text-[#9ab8c6]">Team license with shared use</p>
        </div>
        <ul className="space-y-2 text-sm text-[#d1d7de]">
          {planLines.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" />
              {line}
            </li>
          ))}
        </ul>
        {message ? (
          <p className="rounded-md border border-[#263041] bg-[#0d1117] p-3 text-xs text-[#9da7b5]">
            {message}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={handleCheckoutOpen}
          disabled={isOpening || isUnlocking}
          className="w-full sm:w-auto"
        >
          {isOpening ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" /> Pay and unlock
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => void unlockAfterCheckout()}
          disabled={isUnlocking}
          className="w-full sm:w-auto"
        >
          {isUnlocking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking webhook
            </>
          ) : (
            <>
              Unlock after payment <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
