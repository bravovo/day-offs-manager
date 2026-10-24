import { Router } from "express";
import {
  getTeamController,
  getUserTeamsController,
  postTeamController,
  updateTeamController,
} from "../controllers/teams.controller.ts";

const router = Router();

router.post("/", postTeamController);

router.get("/", getUserTeamsController);

router.get("/:teamId", getTeamController);

router.put("/:teamId", updateTeamController);

export default router;
