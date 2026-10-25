import type mongoose from "mongoose";

export interface AppError extends Error {
  status: number;
}

export type Role = "super" | "admin" | "manager" | "worker" | "user";

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
  role: Exclude<Role, "user">;
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
