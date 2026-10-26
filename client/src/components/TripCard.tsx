import { useState } from "react";
import type { Trip } from "../types";
import { formatDate, formatDuration, formatTime } from "../utils/format";
import { BookingForm } from "./BookingForm";

interface TripCardProps {
  trip: Trip;
  onBooked: () => void;
}

export function TripCard({ trip, onBooked }: TripCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const departure = new Date(trip.departureAt);
  const arrival = new Date(departure.getTime() + trip.durationMin * 60_000);
  const isFull = trip.seatsLeft === 0;

  function handleSuccess(message: string) {
    setIsBooking(false);
    setConfirmation(message);
    onBooked(); //reload
  }

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
        {!isBooking && (
          <button disabled={isFull} onClick={() => { setConfirmation(null); setIsBooking(true); }}>
            {isFull ? "Full" : "Book a seat"}
          </button>
        )}
      </div>

      {isBooking && (
        <BookingForm trip={trip} onSuccess={handleSuccess} onCancel={() => setIsBooking(false)} />
      )}

      {confirmation && <p className="success">{confirmation}</p>}
    </article>
  );
}