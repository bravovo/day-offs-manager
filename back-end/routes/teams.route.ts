import { Router } from "express";
import {
  getTeamController,
  getUserTeamsController,
  postTeamController,
} from "../controllers/teams.controller.ts";

const router = Router();

router.post("/", postTeamController);

router.get("/", getUserTeamsController);

router.get("/:teamId", getTeamController);

export default router;
