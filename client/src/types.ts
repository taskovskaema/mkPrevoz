//what the API returns for a trip
export interface Trip {
  id: number;
  driverName: string;
  fromCity: string;
  toCity: string;
  departureAt: string; 
  durationMin: number;
  totalSeats: number;
  priceMkd: number;
  seatsLeft: number;
}

// what we send to create a trip
//everything except id and seatsLeft
export type NewTrip = Omit<Trip, "id" | "seatsLeft">;

export interface NewBooking {
  passengerName: string;
  email: string;
}

export interface Booking {
  id: number;
  tripId: number;
  passengerName: string;
  email: string;
  createdAt: string;
}