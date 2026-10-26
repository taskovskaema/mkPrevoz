import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const trips = [
  { driverName: "Marko", fromCity: "Skopje", toCity: "Ohrid", departureAt: daysFromNow(1, 8), durationMin: 180, totalSeats: 3, priceMkd: 500, passengers: 1 },
  { driverName: "Elena", fromCity: "Bitola", toCity: "Skopje", departureAt: daysFromNow(1, 14, 30), durationMin: 150, totalSeats: 4, priceMkd: 450, passengers: 2 },
  { driverName: "Dejan", fromCity: "Kumanovo", toCity: "Skopje", departureAt: daysFromNow(2, 7, 15), durationMin: 40, totalSeats: 2, priceMkd: 150, passengers: 2 },
  { driverName: "Ana", fromCity: "Skopje", toCity: "Štip", departureAt: daysFromNow(2, 17), durationMin: 75, totalSeats: 3, priceMkd: 250, passengers: 0 },
  { driverName: "Bojan", fromCity: "Tetovo", toCity: "Skopje", departureAt: daysFromNow(3, 9), durationMin: 45, totalSeats: 4, priceMkd: 150, passengers: 1 },
  { driverName: "Ivana", fromCity: "Strumica", toCity: "Skopje", departureAt: daysFromNow(3, 16), durationMin: 120, totalSeats: 3, priceMkd: 400, passengers: 0 },
  { driverName: "Nikola", fromCity: "Skopje", toCity: "Gevgelija", departureAt: daysFromNow(4, 10), durationMin: 105, totalSeats: 4, priceMkd: 350, passengers: 3 },
  { driverName: "Sara", fromCity: "Ohrid", toCity: "Bitola", departureAt: daysFromNow(5, 12), durationMin: 70, totalSeats: 3, priceMkd: 250, passengers: 0 },
];

async function main() {
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();

  for (const { passengers, ...trip } of trips) {
    await prisma.trip.create({
      data: {
        ...trip,
        bookings: {
          create: Array.from({ length: passengers }, (_, i) => ({
            passengerName: `Passenger ${i + 1}`,
            email: `passenger${i + 1}.${trip.driverName.toLowerCase()}@example.com`,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${trips.length} trips`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());