import type mongoose from "mongoose";

export interface AppError extends Error {
  status: number;
}

export class ErrorExtended extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Role = "super" | "admin" | "manager" | "worker" | "user";
export type ExcludeRole = Exclude<Role, "user">;

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female";
  password: string;
  role: Role;
}

export type UserNoRole = Omit<User, "role">;

export interface TeamMember {
  memberId: mongoose.Types.ObjectId;
  role: ExcludeRole;
  day: number;
  sick: number;
}

export type DayOffSystem = "all-in" | "accum";

export interface Team {
  id?: string;
  title: string;
  maxOff: number;
  maxSick: number;
  system: DayOffSystem;
  members: TeamMember[];
}

export type RequestType = "day" | "sick";

export type RequestStatus = "pending" | "approved" | "rejected";
