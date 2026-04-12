// Raw types matching the messy, inconsistent mock API responses.
// Each API was "built by a different team" — hence different conventions.

// --- Flights API (camelCase, cents, nested segments) ---

export interface FlightSegment {
  from: string;
  to: string;
  duration: string;
  aircraft: string;
}

export interface FlightRaw {
  flightId: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  priceInCents: number;
  currency: string;
  segments: FlightSegment[];
  cabinClass: string;
  seatsRemaining: number;
}

export interface FlightRawResponse {
  status: string;
  data: {
    outbound: FlightRaw[];
    return: FlightRaw[];
  };
}

// --- Hotels API (snake_case, string prices, DD-MM-YYYY) ---

export interface HotelAddress {
  street: string;
  district: string;
  city: string;
}

export interface HotelRaw {
  hotel_id: string;
  hotel_name: string;
  star_rating: number;
  address: HotelAddress;
  price_per_night: string;
  currency_code: string;
  total_price: string;
  amenities: string[];
  review_score: string;
  review_count: number;
  images: string[];
  available_rooms: number;
}

export interface HotelRawResponse {
  result_code: number;
  hotels_found: HotelRaw[];
}

// --- Weather API (Kelvin, unix timestamps, m/s wind) ---

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherDayRaw {
  dt: number;
  temp: { min: number; max: number };
  weather: WeatherCondition;
  wind: { speed: number; deg: number };
  humidity: number;
  precipitation_probability: number;
}

export interface WeatherRawResponse {
  location: { name: string; country: string; lat: number; lon: number };
  forecast: WeatherDayRaw[];
  units: string;
}
