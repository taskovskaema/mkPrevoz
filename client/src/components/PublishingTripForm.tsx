import { useState, type ChangeEvent, type FormEvent } from "react";
import { createTrip } from "../api";
import { CITIES } from "../data/cities";

const emptyForm = {
  driverName: "",
  fromCity: "Skopje",
  toCity: "Ohrid",
  date: "",
  time: "08:00",
  durationMin: "180",
  totalSeats: "3",
  priceMkd: "500",
};

type FormState = typeof emptyForm;

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

interface PublishTripFormProps {
  onPublished: () => void;
}

export function PublishTripForm({ onPublished }: PublishTripFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser from reloading the page

    if (form.fromCity === form.toCity) {
      setError("Departure and destination must be different cities.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createTrip({
        driverName: form.driverName,
        fromCity: form.fromCity,
        toCity: form.toCity,
        departureAt: new Date(`${form.date}T${form.time}`).toISOString(),
        durationMin: Number(form.durationMin),
        totalSeats: Number(form.totalSeats),
        priceMkd: Number(form.priceMkd),
      });
      setForm(emptyForm);
      onPublished();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the trip.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Offer a ride</h2>
      <p className="muted">Driving somewhere? Publish your trip and let passengers reserve a seat.</p>

      <label>
        Your name
        <input name="driverName" value={form.driverName} onChange={handleChange} required minLength={2} />
      </label>

      <div className="row">
        <label>
          From
          <select name="fromCity" value={form.fromCity} onChange={handleChange}>
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
        </label>
        <label>
          To
          <select name="toCity" value={form.toCity} onChange={handleChange}>
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          Date
          <input type="date" name="date" value={form.date} onChange={handleChange} min={today()} required />
        </label>
        <label>
          Departure time
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </label>
      </div>

      <div className="row">
        <label>
          Duration (min)
          <input type="number" name="durationMin" value={form.durationMin} onChange={handleChange} min={15} max={1440} step={15} required />
        </label>
        <label>
          Seats
          <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange} min={1} max={8} required />
        </label>
        <label>
          Price (MKD)
          <input type="number" name="priceMkd" value={form.priceMkd} onChange={handleChange} min={0} max={10000} step={50} required />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Publishing…" : "Publish trip"}
      </button>
    </form>
  );
}