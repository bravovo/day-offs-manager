export interface Team {
  _id: string;
  title: string;
  members: Array<{
    memberId: string;
    role: string;
  }>;
}

export type DayOffSystem = "all-in" | "accum";

export interface CreateTeam {
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
