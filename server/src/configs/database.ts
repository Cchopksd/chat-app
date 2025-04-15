import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const connectToDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MongoDB URI is not defined");
    }
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // stop app if DB connection fails
  }
};

