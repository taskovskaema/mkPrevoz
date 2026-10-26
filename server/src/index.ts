import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { tripsRouter } from "./routes/trips";
import { HttpError } from "./errors";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));         
app.use(express.json());  

app.get("/", (_req, res) => {
  res.json({ name: "mkPrevoz API", health: "/api/health", trips: "/api/trips" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/trips", tripsRouter);

// Central error handler: every thrown error ends up here
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});