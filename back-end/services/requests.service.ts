import mongoose from "mongoose";
import {
  ErrorExtended,
  type ExcludeRole,
  type RequestStatus,
  type RequestType,
} from "../types/types.ts";
import Request from "../schemas/request.schema.ts";
import User from "../schemas/user.schema.ts";
import Team from "../schemas/team.schema.ts";
import {
  dateOnlyToUtcDate,
  getDaysInterval,
  isAllowedToMakeRequest,
  type IsAllowedToMakeRequestProps,
} from "../utils/utils.ts";

interface CreateRequestProps {
  userId: string;
  teamId: string;
  userRole: ExcludeRole;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  type: "day" | "sick";
  description?: string;
}

export const createRequestService = async (payload: CreateRequestProps) => {
  if (!mongoose.isValidObjectId(payload.userId)) {
    throw new ErrorExtended(400, "Ідентифікатор користувача недійсний");
  }

  if (!mongoose.isValidObjectId(payload.teamId)) {
    throw new ErrorExtended(400, "Ідентифікатор команди недійсний");
  }

  const user = await User.findById(payload.userId).select("_id");

  if (!user) {
    throw new ErrorExtended(404, "Користувача не знайдено");
  }

  const team = await Team.findOne({
    _id: payload.teamId,
    "members.memberId": payload.userId,
  });

  if (!team) {
    throw new ErrorExtended(404, "Користувач не є членом команди");
  }

  const teamMember = team.members.find(
    (m) => m.memberId.toString() === payload.userId
  );

  if (!teamMember) {
    throw new ErrorExtended(404, "Помилка ідентифікації користувача");
  }

  console.log("TEAM", team);
  console.log("TEAM MEMBER", teamMember);

  console.log(team.maxSick, teamMember.sick);

  const allowanceCheckPayload: IsAllowedToMakeRequestProps = {
    startDate: new Date(payload.startDate),
    endDate: new Date(payload.endDate),
    halfDay: Boolean(payload.halfDay),
    type: payload.type,
    maxOff: team.maxOff,
    maxSick: team.maxSick,
    day: teamMember.day,
    sick: teamMember.sick,
  };

  if (!isAllowedToMakeRequest({ ...allowanceCheckPayload })) {
    throw new ErrorExtended(
      400,
      "Залишок доступних днів замалий для створення запиту"
    );
  }

  const newRequest = Request.create({
    ...payload,
    startDate: dateOnlyToUtcDate(payload.startDate),
    endDate: dateOnlyToUtcDate(payload.endDate),
  });

  if (!newRequest) {
    throw new ErrorExtended(500, "Помилка створення команди");
  }

  return newRequest;
};

export interface GetRequestProps {
  userId: string;
  requestId: string;
}

export const getRequestService = async ({
  userId,
  requestId,
}: GetRequestProps) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ErrorExtended(400, "Ідентифікатор користувача недійсний");
  }

  if (!mongoose.isValidObjectId(requestId)) {
    throw new ErrorExtended(400, "Ідентифікатор запиту недійсний");
  }

  const request = await Request.findById(requestId);

  if (!request) {
    throw new ErrorExtended(404, "Запит не знайдено");
  }

  const team = await Team.findOne({
    _id: request.teamId,
    "members.memberId": userId,
  });

  if (!team) {
    throw new ErrorExtended(404, "Запит не знайдено");
  }

  return request;
};

export interface GetRequestsProps {
  status?: RequestStatus;
  authorId?: string;
  type?: RequestType;
  requesterId: string;
}

export const getRequestsService = async ({
  status,
  authorId,
  type,
  requesterId,
}: GetRequestsProps) => {
  const userFilters = [...(authorId ? [{ userId: authorId }] : [])];

  const requests = await Request.find({
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(userFilters.length ? { $and: userFilters } : {}),
  });

  if (requests === null || requests === undefined) {
    throw new ErrorExtended(500, "Помилка отримання запитів");
  }

  const teamIds = [
    ...new Set(requests.map((request) => String(request.teamId))),
  ];
  const teams = await Team.find(
    { _id: { $in: teamIds } },
    { members: 1 }
  ).lean();
  const teamsById = new Map(teams.map((team) => [String(team._id), team]));

  const visibleRequests = requests.filter((request) => {
    const team = teamsById.get(String(request.teamId));
    const requester = team?.members.find(
      (member) => String(member.memberId) === requesterId
    );
    const author = team?.members.find(
      (member) => String(member.memberId) === String(request.userId)
    );

    if (!requester || !author) {
      return false;
    }

    if (requester.role === "super") {
      return true;
    }

    if (requester.role === "admin") {
      return author.role !== "super";
    }

    return author.role === "manager" || author.role === "worker";
  });

  const authorIds = [
    ...new Set(visibleRequests.map((request) => String(request.userId))),
  ];
  const authors = await User.find({ _id: { $in: authorIds } })
    .select("_id firstName lastName email")
    .lean();
  const authorsById = new Map(
    authors.map((author) => [String(author._id), author])
  );

  return visibleRequests.map((request) => ({
    ...request.toObject(),
    author: authorsById.get(String(request.userId)) ?? null,
  }));
};

export interface PatchMarkRequestProps {
  requestId: string;
  newStatus: RequestStatus;
}

export const patchMarkRequestService = async ({
  requestId,
  newStatus,
}: PatchMarkRequestProps) => {
  if (!mongoose.isValidObjectId(requestId)) {
    throw new ErrorExtended(400, "Ідентифікатор запиту невірний");
  }

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ErrorExtended(404, "Запит не знайдено");
  }

  const team = await Team.findById(request.teamId).select(
    "maxOff maxSick members"
  );
  if (!team) {
    throw new ErrorExtended(404, "Команду не знайдено");
  }

  const teamMember = team.members.find(
    (member) => String(member.memberId) === String(request.userId)
  );
  if (!teamMember) {
    throw new ErrorExtended(404, "Помилка ідентифікації користувача");
  }

  const allowanceCheckPayload: IsAllowedToMakeRequestProps = {
    startDate: new Date(request.startDate),
    endDate: new Date(request.endDate),
    halfDay: Boolean(request.halfDay),
    type: request.type,
    maxOff: team.maxOff,
    maxSick: team.maxSick,
    day: teamMember.day,
    sick: teamMember.sick,
  };

  if (!isAllowedToMakeRequest({ ...allowanceCheckPayload })) {
    throw new ErrorExtended(
      400,
      "Залишок доступних днів замалий для створення запиту"
    );
  }

  const datesInterval = getDaysInterval(
    new Date(request.startDate),
    new Date(request.endDate)
  );
  const finalInterval = Boolean(request.halfDay)
    ? datesInterval * 0.5
    : datesInterval;

  let updatedRequest = null;
  let updatedTeamMember = null;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId },
      { status: newStatus }
    );
    if (!updatedRequest) {
      throw new ErrorExtended(500, "Помилка оновлення статусу запиту");
    }

    updatedTeamMember = await Team.findOneAndUpdate(
      {
        members: {
          $elemMatch: {
            memberId: teamMember.memberId,
          },
        },
      },
      request.type === "day"
        ? { day: teamMember.day + finalInterval }
        : { sick: teamMember.sick + finalInterval }
    );
    if (!updatedTeamMember) {
      throw new ErrorExtended(500, "Помилка оновлення статусу запиту");
    }

    session.commitTransaction();
  } catch (error) {
    session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return { updatedRequest, updatedTeamMember };
};
