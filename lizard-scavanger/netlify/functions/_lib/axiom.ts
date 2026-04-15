import { Axiom } from "@axiomhq/js";

let client: Axiom | null = null;
let triedInit = false;
const FALLBACK: Record<string, unknown>[] = [];
const MAX_FALLBACK = 50;

function getClient(): Axiom | null {
  if (client) return client;
  if (triedInit) return null;
  triedInit = true;
  if (!process.env.AXIOM_TOKEN) return null;
  client = new Axiom({ token: process.env.AXIOM_TOKEN });
  return client;
}

export async function logToAxiom(fields: Record<string, unknown>): Promise<void> {
  const event = { _time: new Date().toISOString(), ...fields };
  const c = getClient();
  if (!c) {
    pushFallback(event);
    return;
  }
  const dataset = process.env.AXIOM_DATASET || "scavenger-dev";
  try {
    c.ingest(dataset, [event]);
    await c.flush();
  } catch (err) {
    console.warn("axiom ingest failed", err);
    pushFallback(event);
  }
}

function pushFallback(event: Record<string, unknown>) {
  FALLBACK.push(event);
  if (FALLBACK.length > MAX_FALLBACK) FALLBACK.shift();
}

export function getFallbackEvents(): Record<string, unknown>[] {
  return [...FALLBACK];
}
