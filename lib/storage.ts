import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type OrderRecord = {
  id: string;
  eventName: string;
  receivedAt: string;
  payload: unknown;
};

type StoreShape = {
  orders: OrderRecord[];
  paidNonces: Array<{
    nonce: string;
    orderId: string;
    paidAt: string;
  }>;
};

const STORE_DIR = join(process.cwd(), ".data");
const STORE_FILE = join(STORE_DIR, "payments.json");

async function ensureStore(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
}

async function readStore(): Promise<StoreShape> {
  await ensureStore();

  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      orders: parsed.orders ?? [],
      paidNonces: parsed.paidNonces ?? []
    };
  } catch {
    return { orders: [], paidNonces: [] };
  }
}

export async function saveWebhookEvent(record: OrderRecord): Promise<void> {
  const store = await readStore();
  store.orders.unshift(record);
  store.orders = store.orders.slice(0, 2000);
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function markNonceAsPaid(nonce: string, orderId: string): Promise<void> {
  const store = await readStore();
  const existing = store.paidNonces.find((entry) => entry.nonce === nonce);

  if (!existing) {
    store.paidNonces.unshift({
      nonce,
      orderId,
      paidAt: new Date().toISOString()
    });
    store.paidNonces = store.paidNonces.slice(0, 5000);
    await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }
}

export async function isNoncePaid(nonce: string): Promise<boolean> {
  const store = await readStore();
  return store.paidNonces.some((entry) => entry.nonce === nonce);
}
