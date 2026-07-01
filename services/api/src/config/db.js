import mongoose from "mongoose";
import { ENV } from "../../../../shared/config/appConfig.js";

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize:                10,
        serverSelectionTimeoutMS:   5000,
        socketTimeoutMS:            45000,
        retryWrites:                true,
      });
      mongoose.connection.on("disconnected", () =>
        console.error("MongoDB disconnected")
      );
      mongoose.connection.on("error", (err) =>
        console.error("MongoDB error:", err.message)
      );

      return;
    } catch (err) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
};

export default connectDB;
