import type { DayOffSystem } from "./types.ts";

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  password: string;
  confirmPassword: string;
}

export interface CreateTeamDTO {
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: string[];
}

export interface EditTeamDTO extends CreateTeamDTO {}
