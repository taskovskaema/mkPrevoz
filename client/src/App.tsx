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
    <div className="page">
      <header className="header">
        <h1>mkPrevoz</h1>
        <p className="muted">Intercity rides across North Macedonia. Reserve your seat in advance.</p>
        <nav className="tabs">
          <button className={view === "trips" ? "tab active" : "tab"} onClick={() => setView("trips")}>
            Find a ride
          </button>
          <button className={view === "publish" ? "tab active" : "tab"} onClick={() => setView("publish")}>
            Offer a ride
          </button>
        </nav>
      </header>

      <main>
        {view === "publish" ? (
          <PublishTripForm onPublished={handlePublished} />
        ) : (
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

            {loading && (
              <p className="muted">Loading trips… The free server may need up to a minute to wake up.</p>
            )}
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
        )}
      </main>
    </div>
  );
}

export default App;