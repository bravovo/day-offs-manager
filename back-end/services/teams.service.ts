import mongoose from "mongoose";
import MongoTeam from "../schemas/team.schema.ts";
import type { AppError, Team, TeamMember } from "../types/types.ts";

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
    members: { $elemMatch: { memberId: authorId, role: "super" } },
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

export const updateTeamService = async (updatedTeam: Team, userId: string) => {
  const team = mongoose.isValidObjectId(updatedTeam.id)
    ? await MongoTeam.findById(updatedTeam.id)
    : null;

  if (!team) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  const isTeamSuperAdmin = team.members.some((m) => {
    return String(m.memberId) === userId && m.role === "super";
  });

  if (!isTeamSuperAdmin) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  const membersById = new Map<string, TeamMember>(
    team.members.map((member): [string, TeamMember] => [
      String(member.memberId),
      {
        memberId: member.memberId,
        role: member.role,
      },
    ])
  );

  for (const member of updatedTeam.members) {
    if (!membersById.has(String(member.memberId))) {
      membersById.set(String(member.memberId), member);
    }
  }

  updatedTeam.members = [...membersById.values()];

  const freshTeamData = await MongoTeam.updateOne(
    { _id: team._id },
    {
      $set: {
        title: updatedTeam.title,
        maxOff: updatedTeam.maxOff,
        maxSick: updatedTeam.maxSick,
        system: updatedTeam.system,
        members: updatedTeam.members,
      },
    }
  );

  if (freshTeamData.matchedCount === 0) {
    throw new Error("Помилка оновлення команди");
  }

  return freshTeamData;
};

export const deleteTeamService = async (teamId: string, userId: string) => {
  const team = mongoose.isValidObjectId(teamId)
    ? await MongoTeam.findById(teamId)
    : null;

  if (!team) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  const isTeamSuperAdmin = team.members.some((m) => {
    return String(m.memberId) === userId && m.role === "super";
  });

  if (!isTeamSuperAdmin) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  let deletedTeam = null;
  try {
    session.startTransaction();

    deletedTeam = await MongoTeam.deleteOne({ _id: team._id });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  if (!deletedTeam) {
    throw new Error("Помилка видалення команди");
  }

  return deletedTeam;
};
