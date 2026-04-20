import { Octokit } from "octokit";
import { extractEnvMatches, summarizeEnvMatches } from "@/lib/env-parser";

export type RepoReference = {
  owner: string;
  repo: string;
};

export type ScannedFile = {
  path: string;
  size: number;
  sha: string;
};

const TEXT_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".env",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".md",
  ".txt",
  ".sh",
  ".bash",
  ".zsh",
  ".go",
  ".py",
  ".rb",
  ".php",
  ".java",
  ".kt",
  ".rs",
  ".swift"
]);

const IGNORED_PATH_SEGMENTS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "vendor",
  "target",
  ".turbo"
];

function isTextCandidate(path: string): boolean {
  if (IGNORED_PATH_SEGMENTS.some((segment) => path.split("/").includes(segment))) {
    return false;
  }

  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".")) : "";
  return TEXT_FILE_EXTENSIONS.has(extension) || path.endsWith(".env.example");
}

export function parseRepoInput(input: string): RepoReference {
  const trimmed = input.trim();

  if (trimmed.includes("github.com")) {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Repository URL must include owner and repo.");
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, "")
    };
  }

  const split = trimmed.split("/").filter(Boolean);
  if (split.length !== 2) {
    throw new Error("Use format owner/repo or full GitHub URL.");
  }

  return {
    owner: split[0],
    repo: split[1].replace(/\.git$/, "")
  };
}

export function createGitHubClient(accessToken?: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export async function listRepositories(accessToken: string) {
  const client = createGitHubClient(accessToken);
  const response = await client.request("GET /user/repos", {
    per_page: 100,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member"
  });

  return response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    updatedAt: repo.updated_at,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url
  }));
}

async function fetchRepositoryTree(
  client: Octokit,
  reference: RepoReference
): Promise<ScannedFile[]> {
  const repoMeta = await client.request("GET /repos/{owner}/{repo}", {
    owner: reference.owner,
    repo: reference.repo
  });

  const branch = repoMeta.data.default_branch;
  const treeResponse = await client.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    {
      owner: reference.owner,
      repo: reference.repo,
      tree_sha: branch,
      recursive: "1"
    }
  );

  return (treeResponse.data.tree ?? [])
    .filter((entry) => {
      return entry.type === "blob" && Boolean(entry.path) && Boolean(entry.sha);
    })
    .filter((entry) => {
      const size = entry.size ?? 0;
      return size > 0 && size < 220_000 && isTextCandidate(entry.path);
    })
    .slice(0, 450)
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      sha: entry.sha
    }));
}

function decodeBlobContent(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function run(): Promise<void> {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      results.push(await worker(current));
    }
  }

  const workers = Array.from({ length: Math.max(1, limit) }, () => run());
  await Promise.all(workers);
  return results;
}

export async function scanRepositoryForEnvironmentVariables(
  repoInput: string,
  accessToken?: string
) {
  const reference = parseRepoInput(repoInput);
  const client = createGitHubClient(accessToken);
  const files = await fetchRepositoryTree(client, reference);

  const fileMatches = await mapWithConcurrency(files, 8, async (file) => {
    try {
      const blob = await client.request("GET /repos/{owner}/{repo}/git/blobs/{file_sha}", {
        owner: reference.owner,
        repo: reference.repo,
        file_sha: file.sha
      });

      const content = decodeBlobContent(blob.data.content ?? "");
      return extractEnvMatches(content, file.path);
    } catch {
      return [];
    }
  });

  const matches = fileMatches.flat();
  const variables = summarizeEnvMatches(matches);

  return {
    repository: `${reference.owner}/${reference.repo}`,
    scannedFileCount: files.length,
    variables
  };
}
