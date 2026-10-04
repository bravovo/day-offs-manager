import type { Request, Response, NextFunction } from "express";

import type { CreateUserDTO } from "../types/dto.ts";

import type { AppError } from "../types/types.ts";
import {
  createUserService,
  loginUserService,
} from "../services/auth.services.ts";
import { NODE_ENV } from "../configs/env.ts";

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
        return typeof value !== "string";
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
    next(error);
  }
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: AppError = new Error(
        "Відсутні дані для авторизації"
      ) as AppError;
      error.status = 400;

      throw error;
    }

    const user = await loginUserService({ email, password });

    if (user.status === 200) {
      res.cookie("token", user.refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 7 * 1000,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "strict",
      });
    }

    return res.status(200).json({
      success: true,
      accessToken: user.accessToken,
      user: {
        _id: user.data._id,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        email: user.data.email,
        role: user.data.role,
        gender: user.data.gender || "",
      },
      message: "Авторизація успішна",
    });
  } catch (err) {
    next(err);
  }
};
