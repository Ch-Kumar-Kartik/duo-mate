import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/email.js";
import featureRoutes from "./routes/feature.js";
import aiRoutes from "./routes/ai.js";
import "dotenv/config";
import { connectDB } from "./config/mongodb.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/feature", featureRoutes);
app.use("/ai", aiRoutes);

// Health check — always responds, even when MongoDB is down
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Start server unconditionally so the process is always reachable
app.listen(PORT, () => {
  console.log(`Auth service running on http://localhost:${PORT}`);
});

// Connect to MongoDB in the background — a failed connection won't kill the server
connectDB()
  .then(() => {
    console.log("MongoDB connection established");
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`MongoDB connection failed: ${message}`);
    console.error(
      "DB-backed routes (/auth/google/callback, /email/*) will return errors until MongoDB is available.",
    );
  });

export default app;
