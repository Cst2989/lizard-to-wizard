import type { HotelOption } from "../api/types";

interface HotelCardProps {
  hotel: HotelOption;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="hotel-card">
      <div className="hotel-card-header">
        <h3>{hotel.name}</h3>
        <span className="stars">{"★".repeat(hotel.stars)}{"☆".repeat(5 - hotel.stars)}</span>
      </div>
      <p className="hotel-location">{hotel.location}</p>
      <div className="hotel-card-body">
        <div className="hotel-pricing">
          <span className="price-per-night">${hotel.pricePerNight.toFixed(2)}<small>/night</small></span>
          <span className="total-price">Total: ${hotel.totalPrice.toFixed(2)}</span>
        </div>
        <div className="hotel-rating">
          <span className="rating-score">{hotel.rating}</span>
          <span className="review-count">({hotel.reviewCount} reviews)</span>
        </div>
      </div>
      <div className="hotel-amenities">
        {hotel.amenities.map((a) => (
          <span key={a} className="amenity-tag">{a}</span>
        ))}
      </div>
    </div>
  );
}
