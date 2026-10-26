import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { HttpError } from "../errors";

export const tripsRouter = Router();

// Validation schemas

const createTripSchema = z
  .object({
    driverName: z.string().trim().min(2).max(50),
    fromCity: z.string().trim().min(2).max(50),
    toCity: z.string().trim().min(2).max(50),
    departureAt: z.coerce.date(),
    durationMin: z.number().int().min(15).max(24 * 60),
    totalSeats: z.number().int().min(1).max(8),
    priceMkd: z.number().int().min(0).max(10000),
  })
  .refine((d) => d.fromCity.toLowerCase() !== d.toCity.toLowerCase(), {
    message: "Departure and destination must be different cities",
    path: ["toCity"],
  })
  .refine((d) => d.departureAt > new Date(), {
    message: "Departure must be in the future",
    path: ["departureAt"],
  });

const createBookingSchema = z.object({
  passengerName: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email(),
});


function validationError(error: z.ZodError): HttpError {
  const issue = error.issues[0];
  const field = issue?.path.join(".");
  return new HttpError(400, field ? `${field}: ${issue?.message}` : "Invalid input");
}


tripsRouter.get("/", async (_req, res) => {
  const trips = await prisma.trip.findMany({
    where: { departureAt: { gte: new Date() } },
    orderBy: { departureAt: "asc" },
    include: { _count: { select: { bookings: true } } },
  });

  res.json(
    trips.map(({ _count, ...trip }) => ({
      ...trip,
      seatsLeft: trip.totalSeats - _count.bookings,
    }))
  );
});


tripsRouter.post("/", async (req, res) => {
  const result = createTripSchema.safeParse(req.body);
  if (!result.success) throw validationError(result.error);

  const trip = await prisma.trip.create({ data: result.data });
  res.status(201).json({ ...trip, seatsLeft: trip.totalSeats });
});


tripsRouter.post("/:id/bookings", async (req, res) => {
  const tripId = Number(req.params.id);
  if (!Number.isInteger(tripId)) throw new HttpError(400, "Invalid trip id");

  const result = createBookingSchema.safeParse(req.body);
  if (!result.success) throw validationError(result.error);
  const { passengerName, email } = result.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      //no double booking
      await tx.$queryRaw`SELECT id FROM "Trip" WHERE id = ${tripId} FOR UPDATE`;

      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { _count: { select: { bookings: true } } },
      });

      if (!trip) throw new HttpError(404, "Trip not found");
      if (trip.departureAt < new Date()) throw new HttpError(400, "This trip has already left");
      if (trip._count.bookings >= trip.totalSeats) throw new HttpError(409, "Sorry, this trip is full");

      return tx.booking.create({ data: { tripId, passengerName, email } });
    });

    res.status(201).json(booking);
  } catch (err) {
    //same email booking - 409 conflict
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "This email already has a seat on this trip");
    }
    throw err;
  }
});