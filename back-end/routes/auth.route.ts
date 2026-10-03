import { Router } from "express";

import { postSignIn } from "../controllers/auth.controller.ts";

const router = Router();

router.post("/sign-up", postSignIn);

export default router;
