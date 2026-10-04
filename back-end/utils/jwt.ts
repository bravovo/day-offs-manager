import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../configs/env.ts";
import type { Role } from "../types/types.ts";

export function generateRefreshToken(id: any, role: Role) {
  try {
    return jwt.sign({ id, role }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  } catch (error) {
    return null;
  }
}

export function generateAccessToken(id: any, role: Role) {
  try {
    return jwt.sign({ id, role }, ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });
  } catch (error) {
    return null;
  }
}

export const verifyToken = (token: string, isAccess = false) => {
  try {
    const decoded = jwt.verify(
      token,
      isAccess ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET
    );

    if (decoded) {
      if (typeof decoded === "object" && "id" in decoded && decoded.id) {
        return { id: decoded.id, role: decoded.role, error: null };
      } else {
        return { id: null, role: null, error: "Невірне наповнення токена" };
      }
    }
    return { id: null, role: null, error: "Невірне наповнення токена" };
  } catch (error) {
    if (error && typeof error === "object") {
      if ("name" in error && error.name === "TokenExpiredError") {
        return { id: null, role: null, error: "expired" };
      }
      return {
        id: null,
        role: null,
        error: "message" in error ? error.message : "Помилка перевірки токена",
      };
    }
    return { id: null, role: null, error: "Помилка перевірки токена" };
  }
};
