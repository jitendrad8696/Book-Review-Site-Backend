import mongoose from "mongoose";
import { DB_NAME, DB_URI } from "../config/index.js";

export const connectDB = async () => {
  try {
    const dbInstance = await mongoose.connect(`${DB_URI}/${DB_NAME}`);
    const db = dbInstance.connection.db;

    console.log("Success: MongoDB connected successfully");
    console.log("HOST -", dbInstance.connection.host);
    console.log("DATABASE -", DB_NAME);

    const collections = await db.listCollections().toArray();
    console.log("Collections:");
    collections.forEach((collection) => {
      console.log(" -", collection.name);
    });
  } catch (error) {
    console.error("Error: MongoDB connection failed -", error);
    process.exit(1);
  }
};
