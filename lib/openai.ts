import OpenAI from "openai";
import type { EnvVariable } from "@/lib/env-parser";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

function fallbackDescription(name: string): string {
  const lowered = name.toLowerCase();

  if (lowered.includes("url")) {
    return "Base URL or endpoint used by this application integration.";
  }
  if (lowered.includes("secret")) {
    return "Sensitive secret used for request signing or secure verification.";
  }
  if (lowered.includes("token")) {
    return "Authentication token used when calling an external service API.";
  }
  if (lowered.endsWith("_key") || lowered.includes("apikey") || lowered.includes("api_key")) {
    return "API key used to authenticate requests with a third-party provider.";
  }
  if (lowered.includes("port")) {
    return "Port number the service binds to or connects through.";
  }
  if (lowered.includes("host")) {
    return "Hostname or domain name required for a service connection.";
  }
  if (lowered.includes("database") || lowered.includes("db")) {
    return "Database connection configuration value required at runtime.";
  }

  return "Runtime configuration value required by the app in one or more execution paths.";
}

function buildFallback(variables: EnvVariable[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const variable of variables) {
    map[variable.name] = fallbackDescription(variable.name);
  }
  return map;
}

export async function generateDescriptions(
  variables: EnvVariable[]
): Promise<Record<string, string>> {
  if (variables.length === 0) {
    return {};
  }

  if (!process.env.OPENAI_API_KEY) {
    return buildFallback(variables);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const fallback = buildFallback(variables);

  const payload = variables.map((variable) => ({
    name: variable.name,
    examples: variable.occurrences.slice(0, 3).map((occurrence) => ({
      file: occurrence.filePath,
      line: occurrence.line,
      snippet: occurrence.snippet
    }))
  }));

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert developer tooling assistant. For each environment variable, write one concise sentence that helps maintainers understand purpose and usage context. Keep descriptions practical and specific to code snippets."
        },
        {
          role: "user",
          content: `Return JSON in this shape: {\"descriptions\": [{\"name\": string, \"description\": string}]}. Variables: ${JSON.stringify(payload)}`
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as {
      descriptions?: Array<{ name?: string; description?: string }>;
    };

    const mapped = { ...fallback };
    for (const item of parsed.descriptions ?? []) {
      if (!item.name || !item.description) {
        continue;
      }
      mapped[item.name] = item.description.trim();
    }

    return mapped;
  } catch {
    return fallback;
  }
}
