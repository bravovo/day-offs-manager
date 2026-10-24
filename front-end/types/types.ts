export interface Team {
  _id: string;
  title: string;
  maxOff: number;
  maxSick: number;
  system: DayOffSystem;
  members: Array<{
    memberId: string;
    role: string;
  }>;
}

export type DayOffSystem = "all-in" | "accum";

export interface CreateTeam {
  id?: string;
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: string[];
}

export interface EditTeam {
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: string[];
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}
