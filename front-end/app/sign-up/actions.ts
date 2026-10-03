"use server";

import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "@/configs/env";
import { redirect } from "next/navigation";

export interface FormAction {
  error?: string;
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

  if (!email) {
    return { error: "Електронна пошта не може бути порожня" };
  }

  if (!firstName) {
    return { error: "Ім'я не може бути порожнім" };
  }

  if (!lastName) {
    return { error: "Прізвище не може бути порожнім" };
  }

  if (!password) {
    return { error: "Пароль не може бути порожнім" };
  }

  if (password !== confirmPassword) {
    return { error: "Паролі не співпадають" };
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
        error: error.response?.data?.message || "Помилка створення користувача",
      };
    }
    return { error: "Помилка з'єднання" };
  }

  redirect("/login");
}
