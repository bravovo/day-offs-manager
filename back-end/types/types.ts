export interface AppError extends Error {
  status: number;
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female";
  password: string;
  role: "super" | "admin" | "manager" | "worker" | "user";
}

export type UserNoRole = Omit<User, "role">;
