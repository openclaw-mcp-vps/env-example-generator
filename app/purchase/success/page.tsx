import Link from "next/link";

export default function PurchaseSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <h1 className="mb-3 text-3xl font-bold text-zinc-50">Payment Received</h1>
        <p className="mb-6 text-zinc-300">
          Return to the dashboard and verify using your checkout email. Once verified, the scanner unlocks in this
          browser immediately.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
