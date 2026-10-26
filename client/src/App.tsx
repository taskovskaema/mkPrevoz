import { useEffect, useState } from "react";
import { getTrips } from "./api";
import type { Trip } from "./types";
import { TripCard } from "./components/TripCard";
import { PublishTripForm } from "./components/PublishingTripForm";
import { TripFilters } from "./components/TripFilters";
import "./App.css";

type View = "trips" | "publish";

function App() {
  const [view, setView] = useState<View>("trips");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  // Derived from state: recalculated on every render, never stored separately
  const visibleTrips = trips.filter(
    (trip) =>
      (!fromFilter || trip.fromCity === fromFilter) &&
      (!toFilter || trip.toCity === toFilter)
  );

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

  function handlePublished() {
    setView("trips");
    loadTrips();
  }

  return (
              <>
            <TripFilters
              from={fromFilter}
              to={toFilter}
              onFromChange={setFromFilter}
              onToChange={setToFilter}
            />

            <h2>
              Upcoming trips{" "}
              {!loading && !error && <span className="count">{visibleTrips.length}</span>}
            </h2>

            {loading && <p className="muted">Loading trips…</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && visibleTrips.length === 0 && (
              <div className="empty">
                <p>No trips found{fromFilter || toFilter ? " for this route" : " yet"}.</p>
                <button onClick={() => setView("publish")}>Offer a ride</button>
              </div>
            )}

            <div className="trip-list">
              {visibleTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onBooked={loadTrips} />
              ))}
            </div>
          </>
  );
}

export default App;