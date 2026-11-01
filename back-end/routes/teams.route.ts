import { Router } from "express";
import {
  deleteTeamController,
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

router.delete("/:teamId", deleteTeamController);

export default router;
