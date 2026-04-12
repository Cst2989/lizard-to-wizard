import type { FlightRawResponse } from "./types.js";

export async function fetchFlights(
  baseUrl: string,
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string
): Promise<FlightRawResponse> {
  const params = new URLSearchParams({ origin, destination, departDate, returnDate });
  const res = await fetch(`${baseUrl}/external/flights?${params}`);
  return res.json() as Promise<FlightRawResponse>;
}
