import mongoose from "mongoose";
import MongoTeam from "../schemas/team.schema.ts";
import type { AppError, Team } from "../types/types.ts";

export const createTeamService = async (team: Team) => {
  const session = await mongoose.startSession();
  let createdTeam = null;
  try {
    session.startTransaction();

    createdTeam = await MongoTeam.create(team);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  if (!createdTeam) {
    const error: AppError = new Error("Помилка створення команди") as AppError;
    error.status = 500;

    throw error;
  }

  return createdTeam;
};

export const getUserTeamsService = async (authorId: string) => {
  const teams = await MongoTeam.find({
    "members.memberId": authorId,
    "members.role": "super",
  });

  if (!teams) {
    const error: AppError = new Error("Помилка отримання команд") as AppError;
    error.status = 500;

    throw error;
  }

  return teams;
};

export const getTeamService = async (teamId: string, userId: string) => {
  const team = mongoose.isValidObjectId(teamId)
    ? await MongoTeam.findById(teamId)
    : null;

  if (!team) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  const isTeamMember = team.members.some((m) => {
    return String(m.memberId) === userId;
  });

  if (isTeamMember) {
    return team;
  } else {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }
};
