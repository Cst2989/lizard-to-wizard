import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceBreakdown } from "../PriceBreakdown";

describe("PriceBreakdown", () => {
  const cost = { flights: 950, hotel: 1402.38, total: 2352.38, currency: "USD" };

  it("renders flights subtotal", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$950\.00/)).toBeInTheDocument();
  });

  it("renders hotel subtotal", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$1,402\.38/)).toBeInTheDocument();
  });

  it("renders total", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$2,352\.38/)).toBeInTheDocument();
  });

  it("labels sections correctly", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/flights/i)).toBeInTheDocument();
    expect(screen.getByText(/hotel/i)).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });
});
