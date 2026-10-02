import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./configs/database.js";

import { PORT, CLIENT_ORIGIN } from "./configs/env.js";
import type { AppError } from "./types/types.ts";

import authRoute from "./routes/auth.route.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/", (_req, res, _next) => {
  res.send("API is okay");
});

app.use("/v1/auth", authRoute);

app.use(
  (
    err: Error | AppError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof mongoose.Error.ValidationError) {
      const errorMessage = Object.values(err.errors)[0].message;

      return res.status(400).json({
        success: false,
        message:
          errorMessage ||
          "Помилка редагування даних. Перевірте введені дані на правильність",
      });
    }

    const status =
      "status" in err && typeof err.status === "number" ? err.status : 500;

    return res.status(status).json({ success: false, message: err.message });
  }
);

app.listen(PORT, () => {
  console.log("LISTENING ON PORT", PORT);
});

export default app;
