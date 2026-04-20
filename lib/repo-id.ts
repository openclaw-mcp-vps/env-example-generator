export function encodeRepoId(fullName: string): string {
  return Buffer.from(fullName, "utf8").toString("base64url");
}

export function decodeRepoId(repoId: string): string {
  return Buffer.from(repoId, "base64url").toString("utf8");
}
