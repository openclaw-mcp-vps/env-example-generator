import { Buffer } from "node:buffer";
import { Octokit } from "@octokit/rest";
import {
  extractEnvReferencesFromContent,
  mergeEnvVariables,
  type EnvVariable
} from "@/lib/env-parser";

const MAX_FILES_TO_SCAN = 160;
const MAX_BLOB_SIZE = 260_000;

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".env",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".py",
  ".go",
  ".rb",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".sh",
  ".md",
  ".txt"
]);

const EXCLUDED_PATH_PARTS = [
  "node_modules/",
  ".next/",
  "dist/",
  "build/",
  "coverage/",
  "vendor/",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  ".min.js"
];

function isLikelyTextFile(path: string): boolean {
  const lowered = path.toLowerCase();
  if (EXCLUDED_PATH_PARTS.some((part) => lowered.includes(part))) {
    return false;
  }

  const dot = lowered.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }

  const extension = lowered.slice(dot);
  return TEXT_EXTENSIONS.has(extension);
}

export interface ParsedRepoInput {
  owner: string;
  repo: string;
}

export function parseRepoInput(input: string): ParsedRepoInput {
  const value = input.trim().replace(/\.git$/, "");

  const githubUrlMatch = value.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/.*)?$/i);
  if (githubUrlMatch) {
    return {
      owner: githubUrlMatch[1],
      repo: githubUrlMatch[2]
    };
  }

  const shortMatch = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2]
    };
  }

  throw new Error("Enter a valid GitHub repository URL or owner/repo value.");
}

function createOctokit(accessToken?: string): Octokit {
  return new Octokit(
    accessToken
      ? {
          auth: accessToken
        }
      : undefined
  );
}

export async function listUserRepos(accessToken: string): Promise<
  Array<{
    id: number;
    fullName: string;
    private: boolean;
    updatedAt: string;
  }>
> {
  const octokit = createOctokit(accessToken);
  const response = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    visibility: "all"
  });

  return response.data.map((repo) => ({
    id: repo.id,
    fullName: repo.full_name,
    private: repo.private,
    updatedAt: repo.updated_at ?? ""
  }));
}

async function fetchBlobContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string
): Promise<string | null> {
  const blob = await octokit.git.getBlob({ owner, repo, file_sha: sha });
  if (blob.data.encoding !== "base64") {
    return null;
  }

  const buffer = Buffer.from(blob.data.content, "base64");
  const text = buffer.toString("utf8");

  if (text.includes("\u0000")) {
    return null;
  }

  return text;
}

export async function scanRepositoryForEnvVars(params: {
  repoInput: string;
  accessToken?: string;
}): Promise<{
  owner: string;
  repo: string;
  scannedFiles: number;
  variables: EnvVariable[];
}> {
  const { owner, repo } = parseRepoInput(params.repoInput);
  const octokit = createOctokit(params.accessToken);

  const repoResponse = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoResponse.data.default_branch;

  const tree = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: "true"
  });

  const files = (tree.data.tree ?? [])
    .filter((item) => item.type === "blob" && Boolean(item.path) && Boolean(item.sha))
    .filter((item) => isLikelyTextFile(item.path as string))
    .filter((item) => (item.size ?? 0) < MAX_BLOB_SIZE)
    .slice(0, MAX_FILES_TO_SCAN);

  const collected: EnvVariable[] = [];

  for (const item of files) {
    const path = item.path as string;
    const sha = item.sha as string;

    try {
      const content = await fetchBlobContent(octokit, owner, repo, sha);
      if (!content) {
        continue;
      }
      const refs = extractEnvReferencesFromContent(content, path);
      collected.push(...refs);
    } catch {
      continue;
    }
  }

  return {
    owner,
    repo,
    scannedFiles: files.length,
    variables: mergeEnvVariables(collected)
  };
}
