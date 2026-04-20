export type EnvSnippet = {
  filePath: string;
  line: number;
  snippet: string;
};

export type EnvVariable = {
  name: string;
  required: boolean;
  usageCount: number;
  files: string[];
  snippets: EnvSnippet[];
  description?: string;
};

export type ScanResponse = {
  repository: string;
  scannedFileCount: number;
  variables: EnvVariable[];
};

export type GenerateResponse = {
  repository: string;
  envExample: string;
  descriptions: Record<string, string>;
};
