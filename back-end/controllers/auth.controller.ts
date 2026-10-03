import type { Request, Response, NextFunction } from "express";

import type { CreateUserDTO } from "../types/dto.ts";

import type { AppError } from "../types/types.ts";
import { createUserService } from "../services/auth.services.ts";

export const postSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      gender,
    }: CreateUserDTO = req.body;

    if (
      [email, firstName, lastName, password, confirmPassword].some((value) => {
        typeof value !== "string";
      })
    ) {
      const error: AppError = new Error(
        "Надані дані неправильного формату"
      ) as AppError;
      error.status = 400;

      throw error;
    }

    if (password !== confirmPassword) {
      const error: AppError = new Error("Паролі не співпадають") as AppError;
      error.status = 400;

      throw error;
    }

    if (password.length < 8) {
      const error: AppError = new Error(
        "Пароль повинен мати мінімум 8 символів"
      ) as AppError;
      error.status = 400;

      throw error;
    }

    console.log(gender);

    if (gender && !["male", "female"].includes(gender)) {
      const error: AppError = new Error("Обрано не існуючу стать") as AppError;
      error.status = 400;

      throw error;
    }

    await createUserService({
      email,
      firstName,
      lastName,
      gender: gender as "male" | "female",
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Акаунт створенно успішно",
    });
  } catch (error) {
    console.log("EORR+OROR", error);
    next(error);
  }
};
