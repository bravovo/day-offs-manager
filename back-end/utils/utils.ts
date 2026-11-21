import * as z from "zod";
import type { DayOffSystem, RequestType } from "../types/types.ts";

// export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const checkEmailValidity = (email: string): boolean => {
  return z.email().validate(email);
};

export function dateOnlyToUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysInterval(startDate: Date, endDate: Date): number {
  return (
    Math.round(
      (endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY
    ) + 1
  );
}

export function getAvailableDayOffs(
  maxOff: number,
  system: DayOffSystem,
  date: Date = new Date()
): number {
  if (system === "all-in") {
    return maxOff;
  }

  return Math.min(maxOff, (maxOff / 12) * (date.getUTCMonth() + 1));
}

export interface IsAllowedToMakeRequestProps {
  startDate: Date;
  endDate: Date;
  halfDay: boolean;
  type: RequestType;
  maxOff?: number;
  maxSick?: number;
  day?: number;
  sick?: number;
}

export function isAllowedToMakeRequest({
  startDate,
  endDate,
  halfDay,
  type,
  maxOff,
  maxSick,
  day,
  sick,
}: IsAllowedToMakeRequestProps): boolean {
  const datesInterval = getDaysInterval(startDate, endDate);
  const finalInterval = halfDay ? datesInterval * 0.5 : datesInterval;

  if (type === "day") {
    if (maxOff === undefined || day === undefined) {
      console.log("ONE");
      return false;
    }
    if (maxOff < day + finalInterval) {
      console.log("TWO");
      return false;
    }
  } else {
    console.log(maxSick, sick);
    if (maxSick === undefined || sick === undefined) {
      console.log("THREE");
      return false;
    }
    if (maxSick < sick + finalInterval) {
      console.log("FOUR");
      return false;
    }
  }

  console.log("FIVE");
  return true;
}
