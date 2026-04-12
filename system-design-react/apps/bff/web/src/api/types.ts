// Mirrors server's clean BFF types — what the UI receives

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
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  direction: "outbound" | "return";
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  location: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  imageUrl: string;
}

export interface DayForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
  humidity: number;
  rainChance: number;
}
