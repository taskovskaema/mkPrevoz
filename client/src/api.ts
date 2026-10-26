import type { Booking, NewBooking, NewTrip, Trip } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

export function getTrips() {
  return request<Trip[]>("/trips");
}

export function createTrip(input: NewTrip) {
  return request<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function bookSeat(tripId: number, input: NewBooking) {
  return request<Booking>(`/trips/${tripId}/bookings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}