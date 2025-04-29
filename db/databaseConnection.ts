import mongoose from "mongoose";
import { getEnv } from "../helpers/getEnv";

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(getEnv.MONGO_URI);
    console.log('🟢 Database connected');
  } catch (error) {
    console.error('🔴 Database connection failed');
    throw new Error(error as string);
  }
}