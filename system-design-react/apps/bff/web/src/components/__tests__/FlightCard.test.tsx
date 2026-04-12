import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlightCard } from "../FlightCard";
import type { FlightOption } from "../../api/types";

const flight: FlightOption = {
  id: "AA-1234",
  airline: "American Airlines",
  departure: "2026-06-01T08:30:00Z",
  arrival: "2026-06-01T20:45:00Z",
  duration: "7h15m",
  price: 450,
  currency: "USD",
  direction: "outbound",
};

describe("FlightCard", () => {
  it("renders airline name", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText("American Airlines")).toBeInTheDocument();
  });

  it("renders price in dollars", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/\$450/)).toBeInTheDocument();
  });

  it("renders duration", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/7h15m/)).toBeInTheDocument();
  });

  it("renders direction badge", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/outbound/i)).toBeInTheDocument();
  });
});
