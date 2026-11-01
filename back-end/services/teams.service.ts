import mongoose from "mongoose";
import MongoTeam from "../schemas/team.schema.ts";
import User from "../schemas/user.schema.ts";
import type { AppError, Team, TeamMember } from "../types/types.ts";

const getConflictingMemberEmails = async (
  memberIds: mongoose.Types.ObjectId[],
  excludedTeamId?: mongoose.Types.ObjectId
) => {
  const conflictingTeams = await MongoTeam.find({
    ...(excludedTeamId ? { _id: { $ne: excludedTeamId } } : {}),
    "members.memberId": { $in: memberIds },
  })
    .select("members.memberId")
    .lean();

  const conflictingMemberIds = new Set(
    conflictingTeams.flatMap((conflictingTeam) =>
      conflictingTeam.members
        .filter((member) =>
          memberIds.some((memberId) => String(memberId) === String(member.memberId))
        )
        .map((member) => String(member.memberId))
    )
  );

  const conflictingUsers = await User.find({
    _id: { $in: [...conflictingMemberIds] },
  })
    .select("email")
    .lean();

  return conflictingUsers.map((user) => user.email);
};

export const createTeamService = async (team: Team) => {
  const memberIds = team.members
    .filter((member) => member.role !== "super")
    .map((member) => member.memberId);
  const conflictingMemberEmails = await getConflictingMemberEmails(memberIds);

  if (conflictingMemberEmails.length > 0) {
    const error: AppError = new Error(
      `Користувачі вже входять до іншої команди: ${conflictingMemberEmails.join(", ")}`
    ) as AppError;
    error.status = 409;

    throw error;
  }

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

export const getSuperAdminTeamsService = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    const error: AppError = new Error("Команди не знайдено") as AppError;
    error.status = 404;
    throw error;
  }

  const teams = await MongoTeam.find({
    members: {
      $elemMatch: {
        memberId: userId,
        role: "super",
      },
    },
  }).populate({
    path: "members.memberId",
    select: "firstName lastName email",
  });

  return teams;
};

export const getTeamService = async (teamId: string, userId: string) => {
  const team = mongoose.isValidObjectId(teamId)
    ? await MongoTeam.findOne({
        _id: teamId,
        "members.memberId": userId,
      }).populate({
        path: "members.memberId",
        select: "firstName lastName email",
      })
    : null;

  if (!team) {
    const err: AppError = new Error("Команду не знайдено") as AppError;

    err.status = 404;
    throw err;
  }

  return team;
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

  const memberIds = updatedTeam.members
    .filter((member) => member.role !== "super")
    .map((member) => member.memberId);
  const conflictingMemberEmails = await getConflictingMemberEmails(
    memberIds,
    team._id
  );

  if (conflictingMemberEmails.length > 0) {
    const error: AppError = new Error(
      `Користувачі вже входять до іншої команди: ${conflictingMemberEmails.join(", ")}`
    ) as AppError;
    error.status = 409;

    throw error;
  }

  const superMembers = team.members.filter((member) => member.role === "super");
  const membersById = new Map<string, TeamMember>();

  for (const member of [...superMembers, ...updatedTeam.members]) {
    membersById.set(String(member.memberId), {
      memberId: member.memberId,
      role: superMembers.some(
        (superMember) =>
          String(superMember.memberId) === String(member.memberId)
      )
        ? "super"
        : member.role,
    });
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
