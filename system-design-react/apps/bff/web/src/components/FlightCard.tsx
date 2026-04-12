import type { FlightOption } from "../api/types";

interface FlightCardProps {
  flight: FlightOption;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="flight-card">
      <div className="flight-card-header">
        <span className="airline">{flight.airline}</span>
        <span className={`direction-badge ${flight.direction}`}>
          {flight.direction}
        </span>
      </div>
      <div className="flight-card-body">
        <div className="flight-times">
          <span>{formatTime(flight.departure)}</span>
          <span className="flight-duration">{flight.duration}</span>
          <span>{formatTime(flight.arrival)}</span>
        </div>
        <div className="flight-price">${flight.price.toFixed(2)}</div>
      </div>
    </div>
  );
}
