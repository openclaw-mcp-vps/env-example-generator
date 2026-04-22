import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { AppToaster } from "@/components/app-toaster";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://env-example-generator.app"),
  title: {
    default: "Env Example Generator",
    template: "%s | Env Example Generator"
  },
  description:
    "Scan any GitHub repo for process.env references and ship a complete, accurate .env.example with AI-generated descriptions.",
  keywords: [
    "env example generator",
    "dotenv",
    "developer experience",
    "open source tooling",
    "github scanner"
  ],
  openGraph: {
    title: "Env Example Generator",
    description:
      "Automatically build a useful .env.example file from real code usage. Perfect for open-source maintainer onboarding.",
    url: "https://env-example-generator.app",
    siteName: "Env Example Generator",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Env Example Generator",
    description:
      "Scan a repo, detect environment variables, and generate a contributor-ready .env.example instantly."
  }
};

export const viewport: Viewport = {
  themeColor: "#0d1117"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen bg-[#0d1117] text-zinc-100 antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
