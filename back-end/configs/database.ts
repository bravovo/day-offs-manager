import mongoose from "mongoose";

import { DB_CONNECTION } from "./env.js";

let isConnected: mongoose.ConnectionStates;

export const connectDB = async () => {
  if (isConnected === 1) {
    return;
  }
  try {
    const db = await mongoose.connect(DB_CONNECTION!);
    isConnected = db.connections[0].readyState;
  } catch (err) {
    throw err;
  }
};
