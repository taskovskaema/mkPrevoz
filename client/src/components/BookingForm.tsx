import { useState, type FormEvent } from "react";
import { bookSeat } from "../api";
import type { Trip } from "../types";

interface BookingFormProps {
  trip: Trip;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export function BookingForm({ trip, onSuccess, onCancel }: BookingFormProps) {
  const [passengerName, setPassengerName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await bookSeat(trip.id, { passengerName, email });
      onSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="row">
        <label>
          Your name
          <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} required minLength={2} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={submitting}>
          {submitting ? "Reserving…" : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}