"use server";

import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";

export interface FormAction {
  error?: string | Record<string, string>[];
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

  const errors = [];

  if (!Number.isInteger(maxDayOffs) || maxDayOffs < 0) {
    errors.push({
      maxDayOffs:
        "Максимальна кількість вихідних повинна бути цілим числом від 0",
    });
  }

  if (!Number.isInteger(maxSick) || maxSick < 0) {
    errors.push({
      maxSick:
        "Максимальна кількість лікарняних повинна бути цілим числом від 0",
    });
  }

  if (errors.length > 0) {
    return { error: errors };
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
      const data: { message?: string; errors?: Record<string, string>[] } =
        await response.json();
      return {
        error: data.errors || data.message || "Помилка створення команди",
      };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}

export async function editTeam(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const id = formData.get("id");
  const title = formData.get("title");
  const maxDayOffs = Number(formData.get("maxDayOffs"));
  const maxSick = Number(formData.get("maxSick"));
  const system = formData.get("system");
  const members = formData.getAll("members").flatMap((member) => {
    if (typeof member !== "string") {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(member);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "email" in parsed &&
        "role" in parsed &&
        typeof parsed.email === "string" &&
        typeof parsed.role === "string"
      ) {
        return [{ email: parsed.email, role: parsed.role }];
      }
    } catch {
      return [{ email: member.trim(), role: "worker" }];
    }

    return [];
  });

  if (!id) {
    return {
      error: "Помилка оновлення команди",
    };
  }

  const errors = [];

  if (!Number.isInteger(maxDayOffs) || maxDayOffs < 0) {
    errors.push({
      maxDayOffs:
        "Максимальна кількість вихідних повинна бути цілим числом від 0",
    });
  }

  if (!Number.isInteger(maxSick) || maxSick < 0) {
    errors.push({
      maxSick:
        "Максимальна кількість лікарняних повинна бути цілим числом від 0",
    });
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  try {
    const response = await authenticatedFetch(`${SERVER_URL}/v1/teams/${id}`, {
      method: "PUT",
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
      const data: { message?: string; errors?: Record<string, string>[] } =
        await response.json();
      return {
        error: data.errors || data.message || "Помилка оновлення команди",
      };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}

export async function deleteTeam(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const id = formData.get("id");

  if (!id) {
    return {
      error: "Помилка видалення команди",
    };
  }

  try {
    const response = await authenticatedFetch(`${SERVER_URL}/v1/teams/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data: { message?: string } = await response.json();
      return {
        error: data.message || "Помилка видалення команди",
      };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}
