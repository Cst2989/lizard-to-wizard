import type { HotelRawResponse } from "./types.js";

function toHotelDateFormat(isoDate: string): string {
  // Convert YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export async function fetchHotels(
  baseUrl: string,
  destination: string,
  checkinISO: string,
  checkoutISO: string
): Promise<HotelRawResponse> {
  const checkin = toHotelDateFormat(checkinISO);
  const checkout = toHotelDateFormat(checkoutISO);
  const params = new URLSearchParams({ destination: destination.toLowerCase(), checkin, checkout });
  const res = await fetch(`${baseUrl}/external/hotels?${params}`);
  return res.json() as Promise<HotelRawResponse>;
}
