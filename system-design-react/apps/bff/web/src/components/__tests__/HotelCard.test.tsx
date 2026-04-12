import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HotelCard } from "../HotelCard";
import type { HotelOption } from "../../api/types";

const hotel: HotelOption = {
  id: "htl_001",
  name: "Le Petit Paris",
  stars: 4,
  location: "12 Rue de Rivoli, 1st Arr.",
  pricePerNight: 200.34,
  totalPrice: 1402.38,
  currency: "USD",
  rating: 8.7,
  reviewCount: 342,
  amenities: ["wifi", "breakfast", "pool"],
  imageUrl: "https://example.com/hotel1.jpg",
};

describe("HotelCard", () => {
  it("renders hotel name", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText("Le Petit Paris")).toBeInTheDocument();
  });

  it("renders star rating", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText("★★★★☆")).toBeInTheDocument();
  });

  it("renders price per night", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/\$200\.34/)).toBeInTheDocument();
  });

  it("renders review score", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/8\.7/)).toBeInTheDocument();
  });

  it("renders amenities", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/wifi/i)).toBeInTheDocument();
    expect(screen.getByText(/breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/pool/i)).toBeInTheDocument();
  });
});
