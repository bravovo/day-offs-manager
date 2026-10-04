"use server";

import { SERVER_URL } from "@/configs/env";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface FormAction {
  error?: string;
}

export async function login(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email) {
    return { error: "Електронна пошта не може бути порожня" };
  }

  if (!password) {
    return { error: "Пароль не може бути порожнім" };
  }

  try {
    const response = await axios.post(`${SERVER_URL}/v1/auth/login`, {
      email,
      password,
    });

    if (response.status !== 200) {
      return { error: "Помилка авторизації" };
    }

    if (!response.data.accessToken) {
      return { error: "Авторизація неможлива. Спробуйте пізніше" };
    }

    const setCookieHeaders = response.headers["set-cookie"];
    const tokenCookie = (
      Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
    ).find((cookie) => cookie?.startsWith("token="));
    const refreshToken = tokenCookie?.split(";")[0]?.split("=")[1];

    if (!refreshToken) {
      return { error: "Авторизація неможлива. Спробуйте пізніше" };
    }

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", response.data.accessToken, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
    });
    cookieStore.set("token", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 7,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
    });
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "Помилка авторизації",
      };
    }
    return { error: "Помилка з'єднання" };
  }

  redirect("/");
}
