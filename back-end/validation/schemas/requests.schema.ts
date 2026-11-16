import * as z from "zod";
import type {
  ExcludeRole,
  RequestStatus,
  RequestType,
} from "../../types/types.ts";

const roleValues = [
  "super",
  "admin",
  "manager",
  "worker",
] as const satisfies readonly ExcludeRole[];

export const roleSchema = z.enum(
  roleValues,
  "Користувач з введеною роллю не може створити запит"
);

const typeValues = ["day", "sick"] as const satisfies readonly RequestType[];

const typeSchema = z.enum(typeValues, "Тип запиту вказаний невірно");

export const Request = z.object({
  teamId: z.string("Ідентифікатор команди вказаний невірно"),
  userRole: roleSchema,
  startDate: z.iso.date("Дата початку має бути у форматі YYYY-MM-DD"),
  endDate: z.iso.date("Дата кінця має бути у форматі YYYY-MM-DD"),
  halfDay: z.optional(z.boolean("Значення половини дня вказано невірно")),
  type: typeSchema,
  description: z.optional(
    z.string("Опис запиту введений в неправильному форматі")
  ),
});

export const GetRequest = z.object({
  requestId: z.string("Ідентифікатор запиту вказаний невірно"),
  userRole: roleSchema,
});

const requestStatusValues = [
  "pending",
  "approved",
  "rejected",
] as const satisfies readonly RequestStatus[];

export const requestStatusSchema = z.enum(
  requestStatusValues,
  "Статус запиту вказаний невірно"
);

export const GetRequests = z.object({
  status: z.optional(requestStatusSchema),
  type: z.optional(typeSchema),
  authorId: z.optional(z.string("Ідентифікатор команди вказаний невірно")),
});

export const PatchMarkRequest = z.object({
  newStatus: requestStatusSchema,
  requestId: z.string("Ідентифікатор запиту вказаний невірно"),
  reviewerId: z.string("Ідентифікатор користувача вказаний невірно"),
});
