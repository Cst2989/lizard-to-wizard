interface PriceBreakdownProps {
  cost: { flights: number; hotel: number; total: number; currency: string };
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function PriceBreakdown({ cost }: PriceBreakdownProps) {
  return (
    <div className="price-breakdown">
      <h3>Price Breakdown</h3>
      <div className="price-row">
        <span>Flights</span>
        <span>{formatCurrency(cost.flights)}</span>
      </div>
      <div className="price-row">
        <span>Hotel</span>
        <span>{formatCurrency(cost.hotel)}</span>
      </div>
      <div className="price-row price-total">
        <span>Total</span>
        <span>{formatCurrency(cost.total)}</span>
      </div>
    </div>
  );
}
