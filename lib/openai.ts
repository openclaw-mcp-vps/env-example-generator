import OpenAI from "openai";
import {
  type EnvVariableSummary,
  heuristicDescription
} from "@/lib/env-parser";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type DescriptionMap = Record<string, string>;

function fallbackDescriptions(variables: EnvVariableSummary[]): DescriptionMap {
  return Object.fromEntries(
    variables.map((variable) => [variable.name, heuristicDescription(variable.name)])
  );
}

export async function describeVariablesWithAI(
  repo: string,
  variables: EnvVariableSummary[]
): Promise<DescriptionMap> {
  if (!process.env.OPENAI_API_KEY || variables.length === 0) {
    return fallbackDescriptions(variables);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const input = variables.map((variable) => ({
    name: variable.name,
    required: variable.required,
    files: variable.files.slice(0, 3),
    snippets: variable.snippets
  }));

  const completion = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate concise, concrete environment variable descriptions for software maintainers. Output a JSON object mapping variable names to one-sentence descriptions."
      },
      {
        role: "user",
        content: JSON.stringify({
          repo,
          variables: input,
          constraints: {
            style: "Clear, specific, no fluff.",
            maxWords: 18,
            includeSensitiveWarningForSecrets: true
          }
        })
      }
    ],
    temperature: 0.2
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return fallbackDescriptions(variables);
  }

  try {
    const parsed = JSON.parse(raw) as DescriptionMap;
    const output: DescriptionMap = {};

    for (const variable of variables) {
      const modelText = parsed[variable.name]?.trim();
      output[variable.name] =
        modelText && modelText.length > 0
          ? modelText
          : heuristicDescription(variable.name);
    }

    return output;
  } catch {
    return fallbackDescriptions(variables);
  }
}
