import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  "Scan public and private repos for `process.env.*` usage",
  "Generate .env.example with practical one-line descriptions",
  "Merge duplicate variables from multiple files and contexts",
  "Copy-ready output for immediate commit"
];

export function PricingCard() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <Card className="w-full border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <CardTitle>Maintainer Plan</CardTitle>
        <CardDescription>
          Perfect for open-source projects that need cleaner onboarding and fewer setup questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-end gap-3">
          <div>
            <p className="text-3xl font-bold text-zinc-50">$2</p>
            <p className="text-xs uppercase tracking-wide text-zinc-400">One-time starter unlock</p>
          </div>
          <div className="pb-1">
            <p className="text-2xl font-semibold text-zinc-200">or $7/mo</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Team license</p>
          </div>
        </div>

        <ul className="space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <a
          href={paymentLink}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
          target="_blank"
          rel="noreferrer"
        >
          Buy Access
        </a>
        <p className="text-xs text-zinc-400">
          After checkout, enter the purchase email below to unlock scanning in this browser.
        </p>
      </CardFooter>
    </Card>
  );
}
