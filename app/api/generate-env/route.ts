import { NextResponse } from "next/server";
import { z } from "zod";
import {
  type EnvVariableSummary,
  renderEnvExample
} from "@/lib/env-parser";
import { describeVariablesWithAI } from "@/lib/openai";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

const snippetSchema = z.object({
  filePath: z.string(),
  line: z.number(),
  snippet: z.string()
});

const variableSchema = z.object({
  name: z.string().regex(/^[A-Z][A-Z0-9_]+$/),
  required: z.boolean(),
  usageCount: z.number(),
  files: z.array(z.string()),
  snippets: z.array(snippetSchema)
});

const bodySchema = z.object({
  repository: z.string().min(3),
  variables: z.array(variableSchema)
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const accessCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!verifyAccessToken(accessCookie)) {
    return NextResponse.json(
      { error: "Payment required before generating .env.example." },
      { status: 402 }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation payload" }, { status: 400 });
  }

  const variables: EnvVariableSummary[] = parsed.data.variables;

  try {
    const descriptions = await describeVariablesWithAI(parsed.data.repository, variables);
    const envExample = renderEnvExample(variables, descriptions);

    return NextResponse.json({
      repository: parsed.data.repository,
      descriptions,
      envExample
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate environment file output" },
      { status: 500 }
    );
  }
}
