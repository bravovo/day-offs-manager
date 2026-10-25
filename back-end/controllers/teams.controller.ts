import type { NextFunction, Request, Response } from "express";
import type { CreateTeamDTO, EditTeamDTO } from "../types/dto.ts";
import {
  createTeamService,
  deleteTeamService,
  getTeamService,
  getSuperAdminTeamsService,
  updateTeamService,
} from "../services/teams.service.ts";
import type { Team, TeamMember } from "../types/types.ts";
import mongoose from "mongoose";
import { checkEmailValidity } from "../utils/utils.ts";
import User from "../schemas/user.schema.ts";
import { validateTeam } from "../utils/teams.ts";

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
    const { title, maxDayOffs, maxSick, system, members }: CreateTeamDTO =
      req.body;

    if (!validateTeam(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Введені дані в неправильному форматі",
      });
    }

    const normalizedEmails = [...new Set(members.map((email) => email.trim()))];
    const validEmails = normalizedEmails.filter((email) => {
      return checkEmailValidity(email);
    });

    if (validEmails.length !== normalizedEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Список учасників містить невірно введену електронну пошту",
      });
    }

    const existingUsers = await User.find({
      email: { $in: validEmails },
    }).select("email");

    const hasAll = existingUsers.length === validEmails.length;

    if (!hasAll) {
      return res.status(400).json({
        success: false,
        message: "Список учасників містить неіснуючих користувачів",
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

    const teamMembers: TeamMember[] = existingUsers
      .filter((user) => String(user._id) !== authorId)
      .map((user) => {
        return { memberId: user._id, role: "worker" };
      });

    const teamToCreate: Team = {
      title,
      maxOff: maxDayOffs,
      maxSick,
      system,
      members: [
        {
          memberId: new mongoose.Types.ObjectId(authorId),
          role: "super",
        },
        ...teamMembers,
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

    const userTeams = await getSuperAdminTeamsService(id as string);

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

export const updateTeamController = async (
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

    const { title, maxDayOffs, maxSick, system, members }: EditTeamDTO =
      req.body;

    if (!validateTeam(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Введені дані в неправильному форматі",
      });
    }

    const normalizedEmails = [...new Set(members.map((email) => email.trim()))];
    const validEmails = normalizedEmails.filter((email) => {
      return checkEmailValidity(email);
    });

    if (validEmails.length !== normalizedEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Список учасників містить невірно введену електронну пошту",
      });
    }

    const existingUsers = await User.find({
      email: { $in: validEmails },
    }).select("email");

    const hasAll = existingUsers.length === validEmails.length;

    if (!hasAll) {
      return res.status(400).json({
        success: false,
        message: "Список учасників містить неіснуючих користувачів",
      });
    }

    const teamMembers: TeamMember[] = existingUsers.map((user) => {
      return { memberId: user._id, role: "worker" };
    });

    const teamToUpdate: Team = {
      id: teamId,
      title,
      maxOff: maxDayOffs,
      maxSick,
      system,
      members: [...teamMembers],
    };

    const updatedTeam = await updateTeamService(teamToUpdate, id);

    return res.status(200).json({
      success: true,
      message: "Команду успішно оновлено",
      updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamController = async (
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

    await deleteTeamService(teamId, id);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
