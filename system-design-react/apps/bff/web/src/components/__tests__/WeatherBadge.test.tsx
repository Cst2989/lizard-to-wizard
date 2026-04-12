import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherBadge } from "../WeatherBadge";
import type { DayForecast } from "../../api/types";

const day: DayForecast = {
  date: "2026-06-01",
  tempMin: 15,
  tempMax: 25,
  condition: "Clear",
  icon: "01d",
  humidity: 55,
  rainChance: 10,
};

describe("WeatherBadge", () => {
  it("renders date", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/Jun 1/)).toBeInTheDocument();
  });

  it("renders temperature range", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it("renders condition", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("renders rain chance", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });
});
