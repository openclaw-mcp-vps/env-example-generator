"use client";

import { useMemo } from "react";
import { Copy, FileCode2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Occurrence {
  filePath: string;
  line: number;
  snippet: string;
}

interface VariableEntry {
  name: string;
  occurrences: Occurrence[];
}

interface EnvPreviewProps {
  owner: string;
  repo: string;
  scannedFiles: number;
  variables: VariableEntry[];
  descriptions: Record<string, string>;
  envExample: string;
}

export function EnvPreview({
  owner,
  repo,
  scannedFiles,
  variables,
  descriptions,
  envExample
}: EnvPreviewProps) {
  const totalReferences = useMemo(
    () => variables.reduce((sum, variable) => sum + variable.occurrences.length, 0),
    [variables]
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(envExample);
      toast.success("Copied .env.example to clipboard");
    } catch {
      toast.error("Could not copy text. You can still copy from the preview panel.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{owner + "/" + repo}</Badge>
            <Badge>{scannedFiles} files scanned</Badge>
            <Badge>{totalReferences} references found</Badge>
          </div>
          <CardTitle className="mt-2">Generated .env.example</CardTitle>
          <CardDescription>
            Each variable includes an AI-assisted summary based on how the repo actually uses it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={onCopy}>
              <Copy className="h-4 w-4" />
              Copy Output
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs leading-6 text-zinc-200">
            {envExample}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variable Breakdown</CardTitle>
          <CardDescription>
            Useful for reviewing unexpected vars before committing an updated example file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-800">
            {variables.map((variable) => (
              <div key={variable.name} className="py-4">
                <div className="mb-1 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-zinc-100">{variable.name}</span>
                </div>
                <p className="mb-2 text-sm text-zinc-300">{descriptions[variable.name]}</p>
                <div className="space-y-1 text-xs text-zinc-400">
                  {variable.occurrences.slice(0, 3).map((occurrence) => (
                    <p key={`${variable.name}-${occurrence.filePath}-${occurrence.line}`}>
                      {occurrence.filePath}:{occurrence.line} - {occurrence.snippet}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
