import User from "../schemas/user.schema.ts";
import type { AppError, UserNoRole } from "../types/types.ts";

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
