import type { TripSummary as TripSummaryType } from "../api/types";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";
import { WeatherBadge } from "./WeatherBadge";
import { PriceBreakdown } from "./PriceBreakdown";

interface TripSummaryProps {
  trip: TripSummaryType;
}

export function TripSummary({ trip }: TripSummaryProps) {
  return (
    <div className="trip-summary">
      <div className="trip-header">
        <h2>{trip.destination}</h2>
        <p>
          {trip.dates.from} to {trip.dates.to} ({trip.dates.nights} nights)
        </p>
      </div>

      <section className="trip-section">
        <h3>Flights</h3>
        <div className="card-grid">
          {trip.flights.map((f) => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </div>
      </section>

      <section className="trip-section">
        <h3>Hotels</h3>
        <div className="card-grid">
          {trip.hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>

      <section className="trip-section">
        <h3>Weather Forecast</h3>
        <div className="weather-grid">
          {trip.weather.map((w) => (
            <WeatherBadge key={w.date} day={w} />
          ))}
        </div>
      </section>

      <PriceBreakdown cost={trip.totalCost} />
    </div>
  );
}
