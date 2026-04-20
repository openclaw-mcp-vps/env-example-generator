import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://env-example-generator.vercel.app"),
  title: {
    default: "Env Example Generator",
    template: "%s | Env Example Generator"
  },
  description:
    "Scan any GitHub repository for process.env usage and generate a complete .env.example with clear AI-generated variable descriptions.",
  keywords: [
    "dotenv",
    "env example",
    "developer tools",
    "open source",
    "github",
    "next.js"
  ],
  openGraph: {
    type: "website",
    title: "Env Example Generator",
    description:
      "Automate .env.example generation from real code usage so contributors can run your project in minutes.",
    url: "https://env-example-generator.vercel.app",
    siteName: "Env Example Generator"
  },
  twitter: {
    card: "summary_large_image",
    title: "Env Example Generator",
    description:
      "Generate complete .env.example files by scanning process.env usage across your repo."
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
