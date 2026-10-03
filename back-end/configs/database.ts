import mongoose from "mongoose";

import { DB_CONNECTION } from "./env.js";

let isConnected: mongoose.ConnectionStates;

export const connectDB = async () => {
  if (isConnected === 1) {
    return;
  }
  try {
    if (!DB_CONNECTION) {
      console.log(
        "NO DB CONNECTION ==============================================="
      );
      throw new Error("Неможливо підключитись до бази даних");
    }
    const db = await mongoose.connect(DB_CONNECTION!);
    isConnected = db.connections[0].readyState;
  } catch (err) {
    throw err;
  }
};
