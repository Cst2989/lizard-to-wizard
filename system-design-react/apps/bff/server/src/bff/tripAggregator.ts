import { fetchFlights } from "../services/flightsService.js";
import { fetchHotels } from "../services/hotelsService.js";
import { fetchWeather } from "../services/weatherService.js";
import { convertToUSD } from "../services/currencyService.js";
import type { FlightRaw, HotelRaw, WeatherDayRaw } from "../services/types.js";
import type { TripSummary, FlightOption, HotelOption, DayForecast } from "./types.js";

function normalizeFlights(
  outbound: FlightRaw[],
  returnFlights: FlightRaw[]
): FlightOption[] {
  const normalize = (flight: FlightRaw, direction: "outbound" | "return"): FlightOption => ({
    id: flight.flightId,
    airline: flight.airline,
    departure: flight.departureTime,
    arrival: flight.arrivalTime,
    duration: flight.segments[0]?.duration ?? "N/A",
    price: round2(convertToUSD(flight.priceInCents / 100, flight.currency)),
    currency: "USD",
    direction,
  });

  return [
    ...outbound.map((f) => normalize(f, "outbound")),
    ...returnFlights.map((f) => normalize(f, "return")),
  ];
}

function normalizeHotels(hotels: HotelRaw[]): HotelOption[] {
  return hotels.map((h) => ({
    id: h.hotel_id,
    name: h.hotel_name,
    stars: h.star_rating,
    location: `${h.address.street}, ${h.address.district}`,
    pricePerNight: round2(convertToUSD(parseFloat(h.price_per_night), h.currency_code)),
    totalPrice: round2(convertToUSD(parseFloat(h.total_price), h.currency_code)),
    currency: "USD",
    rating: parseFloat(h.review_score),
    reviewCount: h.review_count,
    amenities: h.amenities,
    imageUrl: h.images[0] ?? "",
  }));
}

function normalizeWeather(forecast: WeatherDayRaw[]): DayForecast[] {
  return forecast.map((day) => ({
    date: new Date(day.dt * 1000).toISOString().split("T")[0],
    tempMin: round2(day.temp.min - 273.15),
    tempMax: round2(day.temp.max - 273.15),
    condition: day.weather.main,
    icon: day.weather.icon,
    humidity: day.humidity,
    rainChance: Math.round(day.precipitation_probability * 100),
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function countNights(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / msPerDay
  );
}

export async function aggregateTrip(
  baseUrl: string,
  destCode: string,
  cityName: string,
  from: string,
  to: string
): Promise<TripSummary> {
  const hotelCity = cityName.toLowerCase();
  const weatherCity = cityName;

  // 1. Call all services in parallel
  const [flightsRaw, hotelsRaw, weatherRaw] = await Promise.all([
    fetchFlights(baseUrl, "NYC", destCode, from, to),
    fetchHotels(baseUrl, hotelCity, from, to),
    fetchWeather(baseUrl, weatherCity, from, to),
  ]);

  // 2. Normalize each
  const flights = normalizeFlights(flightsRaw.data.outbound, flightsRaw.data.return);
  const hotels = normalizeHotels(hotelsRaw.hotels_found);
  const weather = normalizeWeather(weatherRaw.forecast);

  // 3. Compute costs
  // Use cheapest outbound + cheapest return for flight cost
  const outboundFlights = flights.filter((f) => f.direction === "outbound");
  const returnFlights = flights.filter((f) => f.direction === "return");
  const cheapestOutbound = outboundFlights.length > 0
    ? Math.min(...outboundFlights.map((f) => f.price))
    : 0;
  const cheapestReturn = returnFlights.length > 0
    ? Math.min(...returnFlights.map((f) => f.price))
    : 0;
  const totalFlightCost = round2(cheapestOutbound + cheapestReturn);

  // Use first hotel's total price for hotel cost
  const totalHotelCost = hotels.length > 0 ? hotels[0].totalPrice : 0;

  const totalCost = round2(totalFlightCost + totalHotelCost);

  return {
    destination: cityName,
    dates: { from, to, nights: countNights(from, to) },
    flights,
    hotels,
    weather,
    totalCost: {
      flights: totalFlightCost,
      hotel: totalHotelCost,
      total: totalCost,
      currency: "USD",
    },
  };
}
