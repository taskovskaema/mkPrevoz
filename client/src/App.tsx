import { useEffect, useState } from "react";
import { getTrips } from "./api";
import type { Trip } from "./types";
import { TripCard } from "./components/TripCard";
import "./App.css";

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTrips() {
    try {
      const data = await getTrips();
      setTrips(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load trips");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>mkPrevoz</h1>
        <p className="muted">Intercity rides across North Macedonia. Reserve your seat in advance.</p>
      </header>

      <main>
        <h2>Upcoming trips</h2>

        {loading && <p className="muted">Loading trips…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && trips.length === 0 && (
          <p className="muted">No upcoming trips yet.</p>
        )}

        <div className="trip-list">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;