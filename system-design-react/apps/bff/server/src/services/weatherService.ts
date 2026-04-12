import type { WeatherRawResponse } from "./types.js";

function toUnixTimestamp(isoDate: string): number {
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

export async function fetchWeather(
  baseUrl: string,
  city: string,
  fromISO: string,
  toISO: string
): Promise<WeatherRawResponse> {
  const startDate = toUnixTimestamp(fromISO).toString();
  const endDate = toUnixTimestamp(toISO).toString();
  const params = new URLSearchParams({ city, startDate, endDate });
  const res = await fetch(`${baseUrl}/external/weather?${params}`);
  return res.json() as Promise<WeatherRawResponse>;
}
