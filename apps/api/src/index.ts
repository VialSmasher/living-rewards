import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { hasDatabase, pool } from "./db";
import { registerResidentLoyaltyRoutes } from "./modules/resident-loyalty/registerRoutes";

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.APP_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) || true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "living-rewards-api",
    database: hasDatabase ? "configured" : "demo-only",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA || null
  });
});

await registerResidentLoyaltyRoutes(app);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = Number(err?.status || 500);
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message: err?.message || "Internal server error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[startup] Living Rewards API listening on ${port}`);
  console.log(`[startup] database ${hasDatabase ? "configured" : "not configured; demo mode only"}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await pool?.end();
});
