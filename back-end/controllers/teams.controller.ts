import type { NextFunction, Request, Response } from "express";
import type { CreateTeamDTO } from "../types/dto.ts";
import {
  createTeamService,
  getTeamService,
  getUserTeamsService,
} from "../services/teams.service.ts";
import type { Team } from "../types/types.ts";
import mongoose from "mongoose";

export const postTeamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Потрібно авторизуватись" });
    }
    const authorId = String(req.user.id);
    const { title }: CreateTeamDTO = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Назва команди обов'язкова",
      });
    }

    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: "Команда не може існувати без її автора",
      });
    }

    if (!mongoose.isValidObjectId(authorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Некоректний автор" });
    }

    const teamToCreate: Team = {
      title,
      members: [
        {
          memberId: new mongoose.Types.ObjectId(authorId),
          role: "super",
        },
      ],
    };

    const team = await createTeamService(teamToCreate);

    return res.status(201).json({
      success: true,
      message: "Команда успішно створена",
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTeamsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    const { id } = req.user;

    if (!id || (typeof id === "string" && id.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Неможливо визначити, чию команду шукати",
      });
    }

    const userTeams = await getUserTeamsService(id as string);

    return res.status(200).json({
      success: true,
      message: "Команди успішно знайдено",
      teams: userTeams,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamController = async (
  req: Request<{ teamId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    const { teamId } = req.params;
    const { id } = req.user;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Ідентифікатора команди не надано",
      });
    }

    const team = await getTeamService(teamId, id);

    return res.status(200).json({
      success: true,
      message: "Команду успішно знайдено",
      team,
    });
  } catch (error) {
    next(error);
  }
};
