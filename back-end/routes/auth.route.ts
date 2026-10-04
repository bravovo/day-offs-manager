import { Router } from "express";

import { postLogin, postSignIn } from "../controllers/auth.controller.ts";

const router = Router();

router.post("/sign-up", postSignIn);

router.post("/login", postLogin);

export default router;
