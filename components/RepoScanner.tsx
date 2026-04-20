"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { EnvPreview } from "@/components/EnvPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EnvVariable, GenerateResponse, ScanResponse } from "@/types/env";

const schema = z.object({
  repo: z
    .string()
    .min(3, "Enter owner/repo or a full GitHub URL")
    .refine((value) => /github\.com|^[^/\s]+\/[^/\s]+$/.test(value.trim()), {
      message: "Use owner/repo or a full GitHub URL"
    })
});

type RepoFormInput = z.infer<typeof schema>;

type RepoItem = {
  id: number;
  fullName: string;
  private: boolean;
  updatedAt: string;
};

function toRepoPageId(repo: string): string {
  return repo.replace("/", "__");
}

type RepoScannerProps = {
  initialRepo?: string;
};

export function RepoScanner({ initialRepo }: RepoScannerProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [generatedEnv, setGeneratedEnv] = useState<string>("");
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RepoFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      repo: initialRepo ?? ""
    }
  });

  const finalVariables = useMemo<EnvVariable[]>(() => {
    if (!scanResult) {
      return [];
    }

    return scanResult.variables.map((variable) => ({
      ...variable,
      description: descriptions[variable.name]
    }));
  }, [scanResult, descriptions]);

  async function loadRepos() {
    setIsLoadingRepos(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/github/repos", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load repositories from GitHub.");
      }

      const payload = (await response.json()) as { repos: RepoItem[] };
      setRepos(payload.repos);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load repositories.");
    } finally {
      setIsLoadingRepos(false);
    }
  }

  async function scanRepo(values: RepoFormInput) {
    setIsScanning(true);
    setGeneratedEnv("");
    setDescriptions({});
    setErrorMessage(null);

    try {
      const response = await fetch("/api/scan-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: values.repo })
      });

      const payload = (await response.json()) as ScanResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Scan failed");
      }

      setScanResult(payload);
      router.replace(`/scan/${toRepoPageId(payload.repository)}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Repository scan failed.");
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  }

  async function generateEnvExample() {
    if (!scanResult) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: scanResult.repository,
          variables: scanResult.variables
        })
      });

      const payload = (await response.json()) as GenerateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed");
      }

      setGeneratedEnv(payload.envExample);
      setDescriptions(payload.descriptions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate env example."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Scanner</CardTitle>
          <CardDescription>
            Scan source files for <code>process.env.*</code> usage, then generate a
            production-ready <code>.env.example</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-3" onSubmit={form.handleSubmit(scanRepo)}>
            <label htmlFor="repo" className="block text-sm font-medium text-[#9da7b5]">
              Repository URL or owner/repo
            </label>
            <Input
              id="repo"
              placeholder="https://github.com/vercel/next.js"
              {...form.register("repo")}
            />
            {form.formState.errors.repo?.message ? (
              <p className="text-xs text-[#f85149]">{form.formState.errors.repo.message}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning repository
                  </>
                ) : (
                  "Scan repository"
                )}
              </Button>

              {scanResult ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void generateEnvExample()}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating descriptions
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate .env.example
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </form>

          <div className="rounded-lg border border-[#263041] bg-[#0d1117] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Connect GitHub for private repos</p>
                <p className="text-xs text-[#9da7b5]">
                  OAuth grants read access so the scanner can parse private codebases.
                </p>
              </div>
              {status === "authenticated" ? (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => void loadRepos()}>
                    {isLoadingRepos ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading repos
                      </>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" /> Browse repos
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="secondary" onClick={() => void signIn("github")}>
                  <Github className="mr-2 h-4 w-4" /> Connect GitHub
                </Button>
              )}
            </div>

            {repos.length > 0 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {repos.slice(0, 20).map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => form.setValue("repo", repo.fullName, { shouldValidate: true })}
                    className="rounded-md border border-[#263041] bg-[#111827] p-3 text-left text-sm transition hover:border-[#2f6f3e] hover:bg-[#132418]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{repo.fullName}</span>
                      {repo.private ? (
                        <span className="rounded-full border border-[#8b949e] px-2 py-0.5 text-xs text-[#9da7b5]">
                          private
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[#8b949e]">Updated {repo.updatedAt}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-[#5f2121] bg-[#2d1212] p-3 text-sm text-[#ffb3ad]">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {scanResult && generatedEnv ? (
        <EnvPreview
          repository={scanResult.repository}
          variables={finalVariables}
          envExample={generatedEnv}
        />
      ) : null}
    </div>
  );
}
