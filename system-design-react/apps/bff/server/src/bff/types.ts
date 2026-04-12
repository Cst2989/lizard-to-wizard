// Clean, UI-shaped types. This is what the frontend receives.
// All data is normalized: consistent casing, real numbers, standard units.

export interface TripSummary {
  destination: string;
  dates: { from: string; to: string; nights: number };
  flights: FlightOption[];
  hotels: HotelOption[];
  weather: DayForecast[];
  totalCost: { flights: number; hotel: number; total: number; currency: string };
}

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;    // ISO datetime
  arrival: string;      // ISO datetime
  duration: string;
  price: number;        // dollars, not cents
  currency: string;     // always "USD"
  direction: "outbound" | "return";
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  location: string;     // flattened: "12 Rue de Rivoli, 1st Arr."
  pricePerNight: number; // number, not string
  totalPrice: number;
  currency: string;     // always "USD"
  rating: number;       // number, not string
  reviewCount: number;
  amenities: string[];
  imageUrl: string;
}

export interface DayForecast {
  date: string;         // YYYY-MM-DD, not unix timestamp
  tempMin: number;      // Celsius, not Kelvin
  tempMax: number;
  condition: string;    // "Clear", "Rain", etc.
  icon: string;
  humidity: number;
  rainChance: number;   // 0-100 percentage
}
