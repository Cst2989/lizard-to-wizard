import { useState } from "react";
import { getTrip } from "./api/client";
import type { TripSummary as TripSummaryType } from "./api/types";
import { SearchForm } from "./components/SearchForm";
import { TripSummary } from "./components/TripSummary";
import { LoadingSkeleton } from "./components/LoadingStates";
import "./App.css";

function App() {
  const [trip, setTrip] = useState<TripSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (dest: string, from: string, to: string) => {
    setIsLoading(true);
    setError(null);
    setTrip(null);

    try {
      const result = await getTrip(dest, from, to);
      setTrip(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Travel Booking</h1>
        <p className="subtitle">Powered by the BFF pattern</p>
      </header>

      <main>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <LoadingSkeleton />}
        {error && <div className="error-message">{error}</div>}
        {trip && <TripSummary trip={trip} />}
      </main>
    </div>
  );
}

export default App;
