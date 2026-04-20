export type EnvMatch = {
  name: string;
  filePath: string;
  line: number;
  snippet: string;
  optional: boolean;
};

export type EnvVariableSummary = {
  name: string;
  required: boolean;
  usageCount: number;
  files: string[];
  snippets: Array<{
    filePath: string;
    line: number;
    snippet: string;
  }>;
};

const DOT_REGEX = /\bprocess\.env\.([A-Z][A-Z0-9_]+)/g;
const BRACKET_REGEX = /\bprocess\.env\[['"]([A-Z][A-Z0-9_]+)['"]\]/g;

function isLikelyOptional(line: string): boolean {
  return /(\?\?|\|\||default|fallback)/i.test(line);
}

function collectLineMatches(
  lineText: string,
  lineNumber: number,
  filePath: string,
  regex: RegExp
): EnvMatch[] {
  const results: EnvMatch[] = [];
  regex.lastIndex = 0;

  for (const match of lineText.matchAll(regex)) {
    const name = match[1];
    if (!name) {
      continue;
    }

    results.push({
      name,
      filePath,
      line: lineNumber,
      snippet: lineText.trim().slice(0, 240),
      optional: isLikelyOptional(lineText)
    });
  }

  return results;
}

export function extractEnvMatches(content: string, filePath: string): EnvMatch[] {
  const lines = content.split(/\r?\n/);
  const matches: EnvMatch[] = [];

  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    matches.push(...collectLineMatches(lineText, lineNumber, filePath, DOT_REGEX));
    matches.push(...collectLineMatches(lineText, lineNumber, filePath, BRACKET_REGEX));
  });

  return matches;
}

export function summarizeEnvMatches(matches: EnvMatch[]): EnvVariableSummary[] {
  const grouped = new Map<string, EnvVariableSummary>();

  for (const match of matches) {
    const current = grouped.get(match.name);

    if (!current) {
      grouped.set(match.name, {
        name: match.name,
        required: !match.optional,
        usageCount: 1,
        files: [match.filePath],
        snippets: [
          {
            filePath: match.filePath,
            line: match.line,
            snippet: match.snippet
          }
        ]
      });
      continue;
    }

    current.required = current.required || !match.optional;
    current.usageCount += 1;

    if (!current.files.includes(match.filePath)) {
      current.files.push(match.filePath);
    }

    if (current.snippets.length < 4) {
      current.snippets.push({
        filePath: match.filePath,
        line: match.line,
        snippet: match.snippet
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function heuristicDescription(variableName: string): string {
  if (variableName.endsWith("_URL") || variableName.includes("DATABASE_URL")) {
    return "Connection URL used to reach an external service or database.";
  }

  if (variableName.includes("SECRET") || variableName.includes("TOKEN")) {
    return "Sensitive credential used for authentication or signing.";
  }

  if (variableName.includes("KEY")) {
    return "API key used to authenticate requests to a third-party service.";
  }

  if (variableName.includes("PORT")) {
    return "Port number the service listens on in local or production environments.";
  }

  if (variableName.startsWith("NEXT_PUBLIC_")) {
    return "Client-exposed configuration available in browser-side Next.js code.";
  }

  return "Runtime configuration value required by application code paths.";
}

export function renderEnvExample(
  variables: EnvVariableSummary[],
  descriptions: Record<string, string>
): string {
  const lines: string[] = [];

  for (const variable of variables) {
    const description = descriptions[variable.name] ?? heuristicDescription(variable.name);
    const requirement = variable.required ? "required" : "optional";
    lines.push(`# ${description} (${requirement})`);
    lines.push(`${variable.name}=`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
