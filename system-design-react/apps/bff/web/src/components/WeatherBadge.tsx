import type { DayForecast } from "../api/types";

interface WeatherBadgeProps {
  day: DayForecast;
}

function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeatherBadge({ day }: WeatherBadgeProps) {
  return (
    <div className="weather-badge">
      <div className="weather-date">{formatDate(day.date)}</div>
      <div className="weather-condition">{day.condition}</div>
      <div className="weather-temps">
        <span className="temp-max">{Math.round(day.tempMax)}°</span>
        <span className="temp-min">{Math.round(day.tempMin)}°</span>
      </div>
      <div className="weather-detail">
        <span>{day.rainChance}% rain</span>
      </div>
    </div>
  );
}
