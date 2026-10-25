import type { AppError, DayOffSystem } from "../types/types.ts";

export interface ValidateTeamProps {
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: string[];
}

export const validateTeam = (team: ValidateTeamProps) => {
  const { title, maxDayOffs, maxSick, system, members } = team;

  if (!title || title.trim().length === 0) {
    const err: AppError = new Error("Назва команди обов'язкова") as AppError;

    err.status = 400;
    throw err;
  }

  if (!Number.isInteger(maxDayOffs) || maxDayOffs < 0) {
    const err: AppError = new Error(
      "Максимальна кількість вихідних повинна бути цілим числом від 0"
    ) as AppError;

    err.status = 400;
    throw err;
  }

  if (!Number.isInteger(maxSick) || maxSick < 0) {
    const err: AppError = new Error(
      "Максимальна кількість лікарняних повинна бути цілим числом від 0"
    ) as AppError;

    err.status = 400;
    throw err;
  }

  if (system !== "all-in" && system !== "accum") {
    const err: AppError = new Error(
      "Неправильний тип накопичення вихідних"
    ) as AppError;

    err.status = 400;
    throw err;
  }

  if (
    !Array.isArray(members) ||
    !members.every((member) => typeof member === "string")
  ) {
    const err: AppError = new Error(
      "Список учасників має неправильний формат"
    ) as AppError;

    err.status = 400;
    throw err;
  }

  return true;
};
