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
