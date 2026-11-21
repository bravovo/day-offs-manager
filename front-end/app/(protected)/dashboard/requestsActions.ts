"use server";

import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import * as z from "zod";
import { DateValidationSchema } from "./requestsValidation";

export interface FormAction {
  error?: string | Record<string, string>;
  success?: boolean;
}

export async function createRequest(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const teamId = formData.get("teamId");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const halfDay = formData.get("halfDay") === "on";
  const type = formData.get("type");
  const description = formData.get("description");

  if (!startDate || !endDate || !type) {
    return { error: "Деякі поля не заповнені" };
  }

  const validated = DateValidationSchema.safeParse({
    teamId,
    startDate,
    endDate,
    halfDay,
    type,
    description,
  });

  if (!validated.success) {
    const fieldErrors = z.flattenError(validated.error).fieldErrors;

    return {
      error: Object.entries(fieldErrors).reduce<Record<string, string>>(
        (errors, [field, messages]) => {
          if (messages?.[0]) {
            errors[field] = messages[0];
          }
          return errors;
        },
        {}
      ),
    };
  }

  if (validated.data.startDate > validated.data.endDate) {
    return {
      error: { startDate: "Дата початку не може бути пізніше за дату кінця" },
    };
  }

  if (validated.data.halfDay && validated.data.startDate !== validated.data.endDate) {
    return {
      error: { halfDay: "Для половини дня дата початку має дорівнювати даті кінця" },
    };
  }

  try {
    const response = await authenticatedFetch(`${SERVER_URL}/v1/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamId: validated.data.teamId,
        startDate: validated.data.startDate,
        endDate: validated.data.endDate,
        halfDay: validated.data.halfDay,
        type: validated.data.type,
        description: validated.data.description,
      }),
    });

    if (!response.ok) {
      const data: {
        message?: string;
        errors?: {
          fieldErrors?: Record<string, string[]>;
          formErrors?: string[];
        };
      } = await response.json();

      if (data.errors?.fieldErrors) {
        const fieldErrors = Object.entries(data.errors.fieldErrors).reduce<
          Record<string, string>
        >((errors, [field, messages]) => {
          if (messages?.[0]) {
            errors[field] = messages[0];
          }
          return errors;
        }, {});

        if (Object.keys(fieldErrors).length > 0) {
          return { error: fieldErrors };
        }
      }

      if (data.errors?.formErrors?.[0]) {
        return { error: data.errors.formErrors[0] };
      }

      return {
        error: data.message || "Помилка створення запиту",
      };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}

export async function reviewRequest(
  _previousState: FormAction,
  formData: FormData
): Promise<FormAction> {
  const requestId = formData.get("requestId");
  const decision = formData.get("decision");

  if (typeof requestId !== "string" || typeof decision !== "string") {
    return { error: "Некоректні дані запиту" };
  }

  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Некоректне рішення" };
  }

  try {
    const response = await authenticatedFetch(
      `${SERVER_URL}/v1/requests/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newStatus: decision }),
      }
    );

    if (!response.ok) {
      const data: { message?: string } = await response.json();
      return { error: data.message || "Помилка оновлення запиту" };
    }
  } catch {
    return { error: "Помилка з'єднання" };
  }

  return { success: true };
}
