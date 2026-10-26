import type { Trip } from "../types";
import { formatDate, formatDuration, formatTime } from "../utils/format";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const departure = new Date(trip.departureAt);
  const arrival = new Date(departure.getTime() + trip.durationMin * 60_000);
  const isFull = trip.seatsLeft === 0;

  return (
    <article className={isFull ? "trip-card full" : "trip-card"}>
      <div className="trip-route">
        {trip.fromCity} <span className="arrow">→</span> {trip.toCity}
      </div>

      <div className="trip-time">
        {formatDate(departure)} · {formatTime(departure)} – {formatTime(arrival)}
        <span className="muted"> ({formatDuration(trip.durationMin)})</span>
      </div>

      <div className="trip-meta">
        <span>Driver: {trip.driverName}</span>
        <span className="price">{trip.priceMkd} MKD</span>
      </div>

      <div className="trip-footer">
        <span className={isFull ? "badge badge-full" : "badge"}>
          {isFull ? "Full" : `${trip.seatsLeft} of ${trip.totalSeats} seats left`}
        </span>
        <button disabled={isFull}>{isFull ? "Full" : "Book a seat"}</button>
      </div>
    </article>
  );
}