import { Router } from "express";

import {
  postLogin,
  postRefresh,
  postSignIn,
} from "../controllers/auth.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/sign-up", postSignIn);

router.post("/login", postLogin);

router.post("/refresh", postRefresh);

router.get("/verify", requireAuth, (_req, res) => {
  return res.status(200).json({ success: true });
});

export default router;
