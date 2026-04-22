"use client";

import { useMemo, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EnvPreview } from "@/components/env-preview";

interface RepoItem {
  id: number;
  fullName: string;
  private: boolean;
  updatedAt: string;
}

interface Occurrence {
  filePath: string;
  line: number;
  snippet: string;
}

interface VariableEntry {
  name: string;
  occurrences: Occurrence[];
}

interface ScanResponse {
  owner: string;
  repo: string;
  scannedFiles: number;
  variables: VariableEntry[];
}

interface GenerateResponse {
  descriptions: Record<string, string>;
  envExample: string;
}

interface RepoScannerProps {
  githubConnected: boolean;
  githubLogin?: string;
  initialRepo?: string;
}

export function RepoScanner({ githubConnected, githubLogin, initialRepo }: RepoScannerProps) {
  const [repoInput, setRepoInput] = useState(initialRepo ?? "");
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<(ScanResponse & GenerateResponse) | null>(null);

  const hasVariables = useMemo(() => Boolean(result && result.variables.length > 0), [result]);

  const loadRepos = async () => {
    setIsLoadingRepos(true);
    try {
      const response = await fetch("/api/github/repos", { method: "GET" });
      const data = (await response.json()) as { repos?: RepoItem[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load repositories.");
      }

      setRepos(data.repos ?? []);
      toast.success("GitHub repositories loaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Repository request failed.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const runScan = async () => {
    if (!repoInput.trim()) {
      toast.error("Provide a GitHub URL or owner/repo first.");
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const scanResponse = await fetch("/api/scan-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ repo: repoInput.trim() })
      });

      const scanData = (await scanResponse.json()) as ScanResponse & { error?: string };

      if (!scanResponse.ok) {
        throw new Error(scanData.error ?? "Scan failed.");
      }

      const generateResponse = await fetch("/api/generate-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ variables: scanData.variables })
      });

      const generateData = (await generateResponse.json()) as GenerateResponse & { error?: string };

      if (!generateResponse.ok) {
        throw new Error(generateData.error ?? "Could not generate descriptions.");
      }

      setResult({ ...scanData, ...generateData });

      if (scanData.variables.length === 0) {
        toast("No environment variables found in scanned files.");
      } else {
        toast.success(`Generated ${scanData.variables.length} variables.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="success">Paywall unlocked</Badge>
            {githubConnected ? <Badge>GitHub: @{githubLogin ?? "connected"}</Badge> : <Badge>Public repos only</Badge>}
          </div>
          <CardTitle>Scan Repository</CardTitle>
          <CardDescription>
            Find every `process.env.*` reference, dedupe variables, then generate a polished `.env.example`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={repoInput}
              onChange={(event) => setRepoInput(event.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
            />
            <Button onClick={runScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Generate .env.example"
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-400">
            Private repos are available only when GitHub is connected and your OAuth token has access.
          </div>

          {githubConnected ? (
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-zinc-300">Use your recent repositories:</p>
                <Button variant="secondary" size="sm" onClick={loadRepos} disabled={isLoadingRepos}>
                  {isLoadingRepos ? "Loading..." : "Load My Repos"}
                </Button>
              </div>
              {repos.length > 0 ? (
                <select
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                  onChange={(event) => setRepoInput(event.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a repository
                  </option>
                  {repos.map((repo) => (
                    <option key={repo.id} value={repo.fullName}>
                      {repo.fullName}
                      {repo.private ? " (private)" : ""}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Connect GitHub on the dashboard to scan private repositories.
            </div>
          )}
        </CardContent>
      </Card>

      {result ? (
        hasVariables ? (
          <EnvPreview
            owner={result.owner}
            repo={result.repo}
            scannedFiles={result.scannedFiles}
            variables={result.variables}
            descriptions={result.descriptions}
            envExample={result.envExample}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Variables Found</CardTitle>
              <CardDescription>
                Scanned {result.scannedFiles} files in {result.owner}/{result.repo} and did not detect `process.env.*` usage.
              </CardDescription>
            </CardHeader>
          </Card>
        )
      ) : null}
    </div>
  );
}
