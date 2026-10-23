"use server";

import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";

export interface FormAction {
  error?: string;
  success?: boolean;
}

export async function createTeam(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const title = formData.get("title");
  const maxDayOffs = Number(formData.get("maxDayOffs"));
  const maxSick = Number(formData.get("maxSick"));
  const system = formData.get("system");
  const members = formData
    .getAll("members")
    .filter((member): member is string => typeof member === "string");

  if (!title) {
    return {
      error: "Назва команди не може бути порожня",
    };
  }

  console.log({});

  if (system !== "all-in" && system !== "accum") {
    return {
      error: "Неправильний тип накопичення вихідних",
    };
  }

  if (!Number.isInteger(maxDayOffs) || maxDayOffs < 0) {
    return {
      error: "Максимальна кількість вихідних повинна бути цілим числом від 0",
    };
  }

  if (!Number.isInteger(maxSick) || maxSick < 0) {
    return {
      error: "Максимальна кількість лікарняних повинна бути цілим числом від 0",
    };
  }

  try {
    const response = await authenticatedFetch(`${SERVER_URL}/v1/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        maxDayOffs,
        maxSick,
        system,
        members,
      }),
    });

    if (!response.ok) {
      const data: { message?: string } = await response.json();
      return {
        error: data.message || "Помилка створення команди",
      };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}
