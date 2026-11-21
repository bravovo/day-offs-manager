export interface Team {
  _id: string;
  title: string;
  maxOff: number;
  maxSick: number;
  system: DayOffSystem;
  members: Array<{
    memberId:
      | string
      | {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
    role: string;
    day: number;
    sick: number;
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
  teamId?: string;
  userRole: "super" | "admin" | "manager" | "worker";
}

export type RequestType = "day" | "sick";

export interface RequestActor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Request {
  _id: string;
  status: "pending" | "approved" | "rejected";
  type: RequestType;
  teamId: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  halfDay?: boolean;
  description?: string;
  author?: RequestActor | null;
  reviewedBy?: RequestActor | null;
}

export type DialogRequest = Omit<Request, "_id">;

export type Requests = Request[];

export interface Remains {
  day: number;
  sick: number;
  maxDayOffs: number;
  maxSick: number;
  system: DayOffSystem;
}

export interface RemainsResponse {
  success: boolean;
  message: string;
  remains: Remains;
}

export interface RequestsResponse {
  success: boolean;
  message: string;
  requests: Requests;
}

export interface ExpandedTeamResponse {
  success: boolean;
  message: string;
  team: ExpandedTeam;
}
