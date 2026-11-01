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

export interface ExpandedTeam {
  _id: string;
  title: string;
  maxOff: number;
  maxSick: number;
  system: DayOffSystem;
  members: Array<{
    memberId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
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
export interface EditTeam2 {
  id: string;
  title: string;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
  members: Array<{
    memberId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    role: string;
  }>;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}

export interface TeamResponse {
  success: boolean;
  message: string;
  team: Team;
}

export interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender?: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user: CurrentUser;
}

export interface ExpandedTeamResponse {
  success: boolean;
  message: string;
  team: ExpandedTeam;
}
