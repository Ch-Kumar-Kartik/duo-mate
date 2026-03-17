import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/duo_mate";

export async function connectDB(): Promise<void> {
  const conn = await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});
