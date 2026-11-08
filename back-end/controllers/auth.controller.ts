import type { Request, Response, NextFunction } from "express";

import type { CreateUserDTO } from "../types/dto.ts";

import type { AppError } from "../types/types.ts";
import {
  createUserService,
  getCurrentUserService,
  loginUserService,
} from "../services/auth.service.ts";
import { NODE_ENV } from "../configs/env.ts";
import { generateAccessToken, verifyToken } from "../utils/jwt.ts";
import { CreateUser } from "../validation/schemas/auth.schema.ts";

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
    const validated = CreateUser.safeParse({
      email,
      firstName,
      lastName,
      gender,
      password,
    });

    if (!validated.success) {
      const errors = validated.error.issues.map((err) => {
        const path = err.path[0];
        const message = err.message;

        return { [path]: message };
      });

      return res.status(400).json({
        success: false,
        message: "Виправте помилки в даних",
        errors,
      });
    }

    if (password !== confirmPassword) {
      const error: AppError = new Error("Паролі не співпадають") as AppError;
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

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim().length === 0 ||
      password.trim().length === 0
    ) {
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

export const postRefresh = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.token;

  if (typeof refreshToken !== "string") {
    return res.status(401).json({
      success: false,
      message: "Потрібна авторизація",
    });
  }

  const result = verifyToken(refreshToken);

  if (result.error || !result.id || !result.role) {
    return res.status(401).json({
      success: false,
      message: "Потрібна авторизація",
    });
  }

  const accessToken = generateAccessToken(result.id, result.role);

  if (!accessToken) {
    return res.status(500).json({
      success: false,
      message: "Генерація токена доступу не вдалась",
    });
  }

  return res.status(200).json({ success: true, accessToken });
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    const user = await getCurrentUserService(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const postLogoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 7 * 1000,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "strict",
    });

    return res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
