"use server";

import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "@/configs/env";
import { redirect } from "next/navigation";

export interface FormAction {
  error?: string | Record<string, string>[];
  success?: string;
}

export async function signUp(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const email = formData.get("email");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const password = formData.get("password");
  const confirmPassword = formData.get("passwordConfirm");

  const errors = [];

  if (!email) {
    errors.push({ email: "Електронна пошта не може бути порожня" });
  }

  if (!firstName) {
    errors.push({ firstName: "Ім'я не може бути порожнім" });
  }

  if (!lastName) {
    errors.push({ lastName: "Прізвище не може бути порожнім" });
  }

  if (!password || password.toString().length < 8) {
    errors.push({ password: "Пароль повинен містити не менше 8 символів" });
  }

  if (password !== confirmPassword) {
    errors.push({ confirmPassword: "Паролі не співпадають" });
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  try {
    const response = await axios.post(`${SERVER_URL}/v1/auth/sign-up`, {
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
    });

    if (response.status !== 201) {
      return { error: "Помилка створення користувача" };
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return {
        error:
          error.response?.data?.errors ||
          error.response?.data?.message ||
          "Помилка створення користувача",
      };
    }
    return { error: "Помилка з'єднання" };
  }

  redirect("/login");
}
