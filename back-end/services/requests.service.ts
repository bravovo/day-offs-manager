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
  getAvailableDayOffs,
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

const getApprovedLeaveUsed = async (
  teamId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const yearStart = new Date(`${new Date().getUTCFullYear()}-01-01T00:00:00.000Z`);
  const approvedRequests = await Request.find({
    teamId,
    userId,
    status: "approved",
    startDate: { $gte: yearStart },
  }).select("startDate endDate halfDay type");

  let day = 0;
  let sick = 0;

  for (const request of approvedRequests) {
    const interval = getDaysInterval(
      new Date(request.startDate),
      new Date(request.endDate)
    );
    const usedDays = request.halfDay ? interval * 0.5 : interval;

    if (request.type === "day") {
      day += usedDays;
    } else {
      sick += usedDays;
    }
  }

  return { day, sick };
};

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

  const approvedLeaveUsed = await getApprovedLeaveUsed(
    team._id,
    teamMember.memberId
  );
  const availableDayOffs = getAvailableDayOffs(
    team.maxOff,
    team.system,
    new Date(payload.startDate)
  );

  const allowanceCheckPayload: IsAllowedToMakeRequestProps = {
    startDate: new Date(payload.startDate),
    endDate: new Date(payload.endDate),
    halfDay: Boolean(payload.halfDay),
    type: payload.type,
    maxOff: availableDayOffs,
    maxSick: team.maxSick,
    day: approvedLeaveUsed.day,
    sick: approvedLeaveUsed.sick,
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
  teamId?: string;
  requesterId: string;
}

export const getRequestsService = async ({
  status,
  authorId,
  type,
  teamId,
  requesterId,
}: GetRequestsProps) => {
  const userFilters = [...(authorId ? [{ userId: authorId }] : [])];

  const statusOrder: Record<RequestStatus, number> = {
    approved: 0,
    rejected: 1,
    pending: 2,
  };

  const requests = await Request.find({
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(teamId ? { teamId } : {}),
    ...(userFilters.length ? { $and: userFilters } : {}),
  });

  requests.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

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
  const reviewerIds = [
    ...new Set(
      visibleRequests
        .map((request) =>
          request.reviewedBy ? String(request.reviewedBy) : null
        )
        .filter((reviewerId): reviewerId is string => reviewerId !== null)
    ),
  ];
  const authors = await User.find({ _id: { $in: authorIds } })
    .select("_id firstName lastName email")
    .lean();
  const reviewers = await User.find({ _id: { $in: reviewerIds } })
    .select("_id firstName lastName email")
    .lean();
  const authorsById = new Map(
    authors.map((author) => [String(author._id), author])
  );
  const reviewersById = new Map(
    reviewers.map((reviewer) => [String(reviewer._id), reviewer])
  );

  return visibleRequests.map((request) => ({
    ...request.toObject(),
    author: authorsById.get(String(request.userId)) ?? null,
    reviewedBy: request.reviewedBy
      ? (reviewersById.get(String(request.reviewedBy)) ?? null)
      : null,
  }));
};

export interface PatchMarkRequestProps {
  requestId: string;
  newStatus: RequestStatus;
  reviewerId: string;
}

export const patchMarkRequestService = async ({
  requestId,
  newStatus,
  reviewerId,
}: PatchMarkRequestProps) => {
  if (!mongoose.isValidObjectId(requestId)) {
    throw new ErrorExtended(400, "Ідентифікатор запиту невірний");
  }
  if (!mongoose.isValidObjectId(reviewerId)) {
    throw new ErrorExtended(400, "Ідентифікатор користувача невірний");
  }

  const reviewer = await User.findById(reviewerId);
  if (!reviewer) {
    throw new ErrorExtended(404, "Користувача, що перевіряє запит не знайдено");
  }

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ErrorExtended(404, "Запит не знайдено");
  }
  if (request.status !== "pending") {
    throw new ErrorExtended(
      400,
      "Статус запиту вже змінено і не може бути змінений повторно"
    );
  }

  const team = await Team.findById(request.teamId).select(
    "maxOff maxSick system members"
  );
  if (!team) {
    throw new ErrorExtended(404, "Команду не знайдено");
  }

  const reviewerMember = team.members.find(
    (member) => String(member.memberId) === String(reviewerId)
  );
  if (!reviewerMember) {
    throw new ErrorExtended(
      404,
      "Помилка ідентифікації користувача, що перевіряє запит"
    );
  }

  if (!["super", "admin"].includes(reviewerMember.role)) {
    throw new ErrorExtended(
      403,
      "Користувачу, що перевіряє запит, недозволено цієї дії"
    );
  }

  const teamMember = team.members.find(
    (member) => String(member.memberId) === String(request.userId)
  );
  if (!teamMember) {
    throw new ErrorExtended(404, "Помилка ідентифікації користувача");
  }

  const datesInterval = getDaysInterval(
    new Date(request.startDate),
    new Date(request.endDate)
  );
  const finalInterval = Boolean(request.halfDay)
    ? datesInterval * 0.5
    : datesInterval;

  const shouldConsumeLeave = newStatus === "approved";
  const balanceDelta = shouldConsumeLeave ? finalInterval : 0;

  if (shouldConsumeLeave) {
    const approvedLeaveUsed = await getApprovedLeaveUsed(
      team._id,
      teamMember.memberId
    );
    const availableDayOffs = getAvailableDayOffs(
      team.maxOff,
      team.system,
      new Date(request.startDate)
    );
    const allowanceCheckPayload: IsAllowedToMakeRequestProps = {
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      halfDay: Boolean(request.halfDay),
      type: request.type,
      maxOff: availableDayOffs,
      maxSick: team.maxSick,
      day: approvedLeaveUsed.day,
      sick: approvedLeaveUsed.sick,
    };

    if (!isAllowedToMakeRequest({ ...allowanceCheckPayload })) {
      throw new ErrorExtended(
        400,
        "Залишок доступних днів замалий для створення запиту"
      );
    }
  }

  let updatedRequest = null;
  let updatedTeamMember = null;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId },
      { status: newStatus, reviewedBy: reviewerId },
      { returnDocument: "after", session }
    );
    if (!updatedRequest) {
      throw new ErrorExtended(500, "Помилка оновлення статусу запиту");
    }

    const balanceField = request.type === "day" ? "day" : "sick";
    const currentBalance =
      request.type === "day" ? teamMember.day : teamMember.sick;
    const newBalance = Math.max(0, currentBalance + balanceDelta);

    updatedTeamMember =
      balanceDelta === 0
        ? team
        : await Team.findOneAndUpdate(
            { _id: team._id },
            {
              $set: {
                [`members.$[member].${balanceField}`]: newBalance,
              },
            },
            {
              arrayFilters: [{ "member.memberId": teamMember.memberId }],
              returnDocument: "after",
              session,
            }
          );
    if (!updatedTeamMember) {
      throw new ErrorExtended(500, "Помилка оновлення статусу запиту");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  return { updatedRequest, updatedTeamMember };
};

export interface GetRemainsProps {
  userId: string;
  teamId: string;
}

export const getRemainsService = async ({
  userId,
  teamId,
}: GetRemainsProps) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ErrorExtended(400, "Ідентифікатор користувача недійсний");
  }
  if (!mongoose.isValidObjectId(teamId)) {
    throw new ErrorExtended(400, "Ідентифікатор команди недійсний");
  }

  const user = await User.findById(userId).select("_id");

  if (!user) {
    throw new ErrorExtended(404, "Користувача не знайдено");
  }

  const team = await Team.findOne({
    _id: teamId,
    "members.memberId": user._id,
  });

  if (!team) {
    throw new ErrorExtended(404, "Користувач не є членом команди");
  }

  const teamMember = team.members.find(
    (member) => String(member.memberId) === String(user._id)
  );

  if (!teamMember) {
    throw new ErrorExtended(404, "Помилка ідентифікації користувача");
  }

  const approvedLeaveUsed = await getApprovedLeaveUsed(
    team._id,
    teamMember.memberId
  );
  const accumulatedDayOffs = getAvailableDayOffs(
    team.maxOff,
    team.system
  );

  return {
    day: Math.max(0, accumulatedDayOffs - approvedLeaveUsed.day),
    sick: Math.max(0, team.maxSick - approvedLeaveUsed.sick),
    maxDayOffs: team.maxOff,
    maxSick: team.maxSick,
    system: team.system,
  };
};
