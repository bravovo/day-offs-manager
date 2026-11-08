import type { DayOffSystem } from "../types/types.ts";
import { ValidateTeam } from "../validation/schemas/teams.schema.ts";

export interface ValidateTeamProps {
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: string[] | Array<{ email: string; role: string }>;
}

export const validateTeam = (team: ValidateTeamProps) => {
  const { title, maxDayOffs, maxSick, system, members } = team;

  const validated = ValidateTeam.safeParse({
    title,
    maxDayOffs,
    maxSick,
    system,
  });
  let errors: Record<string, string>[] = [];

  if (!validated.success) {
    errors = validated.error.issues.map((err) => {
      const path = err.path[0];
      const message = err.message;

      return { [path]: message };
    });
  }

  if (
    !Array.isArray(members) ||
    !members.every(
      (member) =>
        typeof member === "string" ||
        (typeof member === "object" &&
          member !== null &&
          typeof member.email === "string" &&
          ["admin", "manager", "worker", "super"].includes(member.role))
    )
  ) {
    errors.push({ members: "Список учасників має неправильний формат" });
  }

  return errors;
};
