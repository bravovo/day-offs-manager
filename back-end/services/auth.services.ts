import User from "../schemas/user.schema.ts";
import type { AppError, UserNoRole } from "../types/types.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.ts";

export const createUserService = async (user: UserNoRole) => {
  const createdUser = await User.create({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    password: user.password,
    role: "user",
  });

  if (!createdUser) {
    const error: AppError = new Error(
      "Помилка створення користувача"
    ) as AppError;
    error.status = 500;

    throw error;
  }
};

interface LoginProps {
  email: string;
  password: string;
}

export const loginUserService = async (data: LoginProps) => {
  const { email, password } = data;
  const user = await User.findOne({ email });

  if (!user) {
    const error: AppError = new Error("Невірні дані авторизації") as AppError;
    error.status = 400;

    throw error;
  }

  const match = await (
    user as typeof user & {
      comparePasswords(password: string): Promise<boolean>;
    }
  ).comparePasswords(password);

  if (!match) {
    const error: AppError = new Error("Невірні дані авторизації") as AppError;
    error.status = 400;

    throw error;
  }

  const refreshToken = generateRefreshToken(user.id, user.role);
  const accessToken = generateAccessToken(user.id, user.role);

  if (!accessToken || !refreshToken) {
    const error: AppError = new Error(
      "Генерація токенів доступу не вдалась"
    ) as AppError;
    error.status = 500;

    throw error;
  }

  return {
    status: 200,
    data: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      gender: user.gender || "",
    },
    accessToken,
    refreshToken,
  };
};
