import { Router } from "express";
import {
  postNewRequest,
  getRequest,
  getRequests,
  patchMarkRequest,
} from "../controllers/requests.controller.ts";

const router = Router();

router.post("/", postNewRequest);

router.get("/", getRequests);

router.get("/:requestId", getRequest);

router.patch("/:requestId", patchMarkRequest);

export default router;
