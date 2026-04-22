import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "purchases.json");

interface PurchaseStore {
  emails: string[];
  sessions: string[];
  updatedAt: string;
}

const DEFAULT_STORE: PurchaseStore = {
  emails: [],
  sessions: [],
  updatedAt: new Date(0).toISOString()
};

async function ensureStoreFile(): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

async function readStore(): Promise<PurchaseStore> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as PurchaseStore;
    return {
      emails: Array.isArray(parsed.emails) ? parsed.emails : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store: PurchaseStore): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function recordPaidEmail(email: string, sessionId?: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  const store = await readStore();

  if (!store.emails.includes(normalized)) {
    store.emails.push(normalized);
  }

  if (sessionId && !store.sessions.includes(sessionId)) {
    store.sessions.push(sessionId);
  }

  store.updatedAt = new Date().toISOString();
  await writeStore(store);
}

export async function hasPaidEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const store = await readStore();
  return store.emails.includes(normalized);
}
