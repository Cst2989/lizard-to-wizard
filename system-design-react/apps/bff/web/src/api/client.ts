import type { TripSummary } from "./types";

export async function getTrip(dest: string, from: string, to: string): Promise<TripSummary> {
  const params = new URLSearchParams({ dest, from, to });
  const res = await fetch(`/api/trip?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trip: ${res.status}`);
  }
  return res.json();
}
