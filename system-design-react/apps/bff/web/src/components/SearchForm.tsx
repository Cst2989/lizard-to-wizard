import { useState, FormEvent } from "react";

interface SearchFormProps {
  onSearch: (dest: string, from: string, to: string) => void;
  isLoading: boolean;
}

const DESTINATIONS = [
  { code: "PAR", name: "Paris" },
  { code: "TYO", name: "Tokyo" },
  { code: "NYC", name: "New York" },
  { code: "BCN", name: "Barcelona" },
  { code: "ROM", name: "Rome" },
];

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [dest, setDest] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (dest && from && to) {
      onSearch(dest, from, to);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-field">
        <label htmlFor="destination">Destination</label>
        <select
          id="destination"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
          required
        >
          <option value="">Select a destination</option>
          {DESTINATIONS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="from">From</label>
        <input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
