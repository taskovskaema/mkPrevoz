# mkPrevoz 

**Scheduled intercity ride-sharing across North Macedonia.** Drivers publish their planned trips, and passengers reserve a seat in advance.

🔗 **Live app:** https://mk-prevoz.vercel.app
🔗 **API:** https://mkprevoz.onrender.com/api/trips

> The API runs on Render's free tier and sleeps after 15 minutes of inactivity, so the first load can take up to a minute.

## The idea

As a student, getting home on weekends is harder than it should be. There's no easy way to find a ride: I search through friends and Facebook groups, call drivers one by one, and often find out the car is already full. Drivers usually post their trips only a few hours before leaving, so I end up checking every day and waiting until the last minute to know if I can travel. Many students I know face the same problem.

So I adapted the scheduling challenge to this. Instead of a host publishing meeting slots, a **driver publishes a planned trip in advance** (date, departure time, duration), and **passengers reserve a seat** with real-time availability. No more calling around to find out a car is full.

| Challenge requirement | mkPrevoz |
|---|---|
| Create time slots (date, start, duration) | **Offer a ride**: route, date, departure time, duration, seats, price |
| See available slots | **Find a ride**: upcoming trips with seats left, searchable by city |
| Book with name + email | Reserve a seat with name + email |
| No double bookings | Full trips are shown as **Full**, and the same email can't book a trip twice |

## Features

- Publish a trip, with validation in both frontend and backend
- Browse upcoming trips, filter by departure/destination city, and see arrival time and seats left
- Book a seat; the list updates instantly and full trips are disabled
- **AI confirmation message** written by Gemini after each booking
- Loading, error, and empty states; responsive on mobile

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript (Vite), hosted on **Vercel** |
| Backend | Node.js + Express + TypeScript, Zod validation, hosted on **Render** |
| Database | PostgreSQL on **Neon**, accessed with the **Prisma** ORM |
| AI | Google Gemini (`gemini-2.5-flash-lite`, free tier) via `@google/genai` |


## Key decisions

**Preventing double bookings (two layers)**
1. **Database constraint:** `@@unique([tripId, email])`, so the same person can't book a trip twice.
2. **Row lock in a transaction:** when booking, the API locks the trip row (`SELECT … FOR UPDATE`), counts bookings, and only then inserts. Two people clicking "Book" on the last seat at the same moment can't both get it.

**Seats left is calculated, not stored.** It's computed as `totalSeats − bookings`, so it can never get out of sync.

**AI comes after.** Gemini is called *after* the booking is saved, with an 8-second timeout. If it fails, the user gets a plain fallback message. The API key lives only on the server.


## Run locally

**Requirements:** Node.js 20+, a PostgreSQL database (e.g. a free [Neon](https://neon.tech) project), and optionally a [Gemini API key](https://aistudio.google.com).

```bash
git clone https://github.com/YOUR-USERNAME/mkPrevoz.git
cd mkPrevoz
```

**Backend**
```bash
cd server
npm install
cp .env.example .env          # then fill in DATABASE_URL and GEMINI_API_KEY
npx prisma migrate deploy     # create tables
npx prisma db seed            # optional: demo trips
npm run dev                   # http://localhost:3000
```

**Frontend** (in a second terminal)
```bash
cd client
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:3000/api
npm run dev                   # http://localhost:5173
```

Without a Gemini key the app still works and uses a standard confirmation message.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | Upcoming trips with `seatsLeft` |
| POST | `/api/trips` | Publish a trip |
| POST | `/api/trips/:id/bookings` | Book a seat → `{ booking, message }` |

Example requests are in [`server/requests.http`](server/requests.http).

## How I used AI tools

## How I used AI tools

I knew the basics of TypeScript and React, but I hadn't built a real project that connects a React frontend to a typed backend, a database, and hosting. I used **Claude** as a step-by-step guide while building it myself, in small steps (setup → database → API → frontend → AI → deploy).

For each step I asked for explanations of the parts that were new to me in a real project (Prisma relations, transactions and row locking, CORS, environment variables in production), then typed, ran, and tested the code myself, and debugged the errors that came up along the way. Some of the issues I worked through:
- A Prisma major version mismatch after running `npm audit fix --force`
- TypeScript build errors from unused code, caused by a missing view switch
- CORS errors on deploy, caused by wrong environment variable URLs

## What I'd improve with more time

- **Pickup point** set by the driver, shown on each trip
- **Passenger phone number** on booking, visible only to the driver
- **Driver dashboard** with login, to see and manage bookings
- **Email confirmation** sending the AI message to the passenger
- **Student coupons and loyalty bonuses**, such as discounts for verified students or a free ride after a number of trips, to make regular travel home cheaper
- **Server-side filtering and pagination** for larger datasets
- More robust **time zone handling** (currently assumes users are in Macedonia)
- **Automated tests**, especially for the overbooking logic
- Upgrade to **Prisma 7** / `prisma.config.ts` (fixes a dev-only `npm audit` warning) and consider **NestJS** for a larger codebase
- Rate limiting on the AI endpoint