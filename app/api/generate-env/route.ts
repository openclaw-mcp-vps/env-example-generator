import { NextRequest, NextResponse } from "next/server";
import { buildEnvExample, type EnvVariable } from "@/lib/env-parser";
import { generateDescriptions } from "@/lib/openai";
import { PAYWALL_COOKIE_NAME, hasValidPaidCookieValue } from "@/lib/paywall";

interface Body {
  variables?: EnvVariable[];
}

function isValidVariable(variable: unknown): variable is EnvVariable {
  if (!variable || typeof variable !== "object") {
    return false;
  }

  const candidate = variable as EnvVariable;
  return (
    typeof candidate.name === "string" &&
    Array.isArray(candidate.occurrences) &&
    candidate.occurrences.every(
      (occurrence) =>
        occurrence &&
        typeof occurrence.filePath === "string" &&
        typeof occurrence.line === "number" &&
        typeof occurrence.snippet === "string"
    )
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const paidCookie = request.cookies.get(PAYWALL_COOKIE_NAME)?.value;
  if (!hasValidPaidCookieValue(paidCookie)) {
    return NextResponse.json({ error: "Paid access is required." }, { status: 402 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawVariables = body.variables;
  if (!rawVariables || !Array.isArray(rawVariables)) {
    return NextResponse.json({ error: "A variables array is required." }, { status: 400 });
  }

  const variables = rawVariables.filter(isValidVariable).sort((a, b) => a.name.localeCompare(b.name));

  try {
    const descriptions = await generateDescriptions(variables);
    const envExample = buildEnvExample(variables, descriptions);
    return NextResponse.json({ descriptions, envExample });
  } catch {
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}
