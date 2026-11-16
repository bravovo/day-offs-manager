import { RequestType } from "@/types/types";
import * as z from "zod";

const typeValues = ["day", "sick"] as const satisfies readonly RequestType[];

const typeSchema = z.enum(typeValues, "Тип запиту вказаний невірно");

export const DateValidationSchema = z.object({
  teamId: z.string("Користувач не є учасником жодної команди"),
  startDate: z.iso.date("Дата початку має бути у форматі YYYY-MM-DD"),
  endDate: z.iso.date("Дата кінця має бути у форматі YYYY-MM-DD"),
  halfDay: z.optional(z.boolean("Значення половини дня вказано невірно")),
  type: typeSchema,
  description: z.optional(
    z.string("Опис запиту введений в неправильному форматі")
  ),
});
