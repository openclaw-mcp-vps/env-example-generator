"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, FileCode2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnvVariable } from "@/types/env";

type EnvPreviewProps = {
  repository: string;
  variables: EnvVariable[];
  envExample: string;
};

export function EnvPreview({ repository, variables, envExample }: EnvPreviewProps) {
  const [copied, setCopied] = useState(false);

  const requiredCount = useMemo(
    () => variables.filter((variable) => variable.required).length,
    [variables]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(envExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-[#7ee787]" />
            Generated .env.example
          </CardTitle>
          <CardDescription>
            {repository} · {variables.length} variables found · {requiredCount} marked required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{requiredCount} required</Badge>
            <Badge className="border-[#264653] bg-[#10242b] text-[#80d7ff]">
              {variables.length - requiredCount} optional
            </Badge>
          </div>
          <div className="overflow-x-auto rounded-md border border-[#263041] bg-[#0d1117]">
            <pre className="p-4 text-sm leading-6 text-[#d1d7de]">{envExample}</pre>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md border border-[#2f6f3e] bg-[#132418] px-3 py-2 text-sm font-medium text-[#7ee787] transition hover:bg-[#17301f]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4" /> Copy .env.example
              </>
            )}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variables and AI Descriptions</CardTitle>
          <CardDescription>
            Review each detected key before committing the file to your repository.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {variables.map((variable) => (
              <div
                key={variable.name}
                className="rounded-lg border border-[#263041] bg-[#0d1117] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-[#161b22] px-2 py-1 text-xs text-[#7ee787]">
                    {variable.name}
                  </code>
                  <span className="text-xs text-[#9da7b5]">
                    {variable.required ? "required" : "optional"} · used {variable.usageCount}x
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#d1d7de]">
                  {variable.description ?? "No description generated."}
                </p>
                <p className="mt-2 text-xs text-[#8b949e]">
                  Seen in {variable.files.slice(0, 3).join(", ")}
                  {variable.files.length > 3 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
