import { GoogleGenAI } from "@google/genai";

interface ConfirmationInput {
  passengerName: string;
  driverName: string;
  fromCity: string;
  toCity: string;
  departureAt: Date;
  priceMkd: number;
}

function formatDeparture(date: Date) {
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Skopje",
  });
}

// Rejects if the promise takes longer than `ms` milliseconds
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function generateConfirmation(input: ConfirmationInput): Promise<string> {
  const when = formatDeparture(input.departureAt);
  const fallback = `Your seat is reserved, ${input.passengerName}! ${input.driverName} leaves ${input.fromCity} for ${input.toCity} on ${when}. Have a great trip!`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const prompt = `You write booking confirmations for mkPrevoz, an intercity ride-sharing app in North Macedonia.
Write a short, warm confirmation message (max 2 sentences) for this booking:
- Passenger: ${input.passengerName}
- Driver: ${input.driverName}
- Route: ${input.fromCity} to ${input.toCity}
- Departure: ${when}
- Price: ${input.priceMkd} MKD, paid to the driver

Mention the route and departure time. You may add one friendly detail about the destination city.
Plain text only, no markdown, at most one emoji.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
        contents: prompt,
      }),
      8000
    );
    return response.text?.trim() || fallback;
  } catch (err) {
    console.error("Gemini failed, using fallback message:", err);
    return fallback;
  }
}