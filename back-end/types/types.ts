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
  memberId: mongoose.Schema.Types.ObjectId;
  role: Omit<Role, "user">;
}
export interface Team {
  title: string;
  members: TeamMember[];
}
