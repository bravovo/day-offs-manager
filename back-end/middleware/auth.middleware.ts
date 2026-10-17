import type { RequestHandler } from "express";

import { verifyToken } from "../utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
      };
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Потрібна авторизація",
    });
  }

  const result = verifyToken(token, true);

  if (result.error || !result.id) {
    return res.status(401).json({
      success: false,
      message: "Потрібна авторизація",
    });
  }

  req.user = { id: result.id, role: result.role };

  next();
};
