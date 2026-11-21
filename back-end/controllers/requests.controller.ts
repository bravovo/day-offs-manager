import type { NextFunction, Request, Response } from "express";
import type { CreateDayOffRequest } from "../types/dto.ts";
import {
  GetRemains,
  GetRequest,
  GetRequests,
  PatchMarkRequest,
  Request as ValidateRequest,
} from "../validation/schemas/requests.schema.ts";
import * as z from "zod";
import {
  createRequestService,
  getRemainsService,
  getRequestService,
  getRequestsService,
  patchMarkRequestService,
} from "../services/requests.service.ts";
import mongoose from "mongoose";
import { getCurrentUserRole } from "../services/auth.service.ts";

export const postNewRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const freshRole = await getCurrentUserRole(req.user?.id, req.body.teamId);

    if (!freshRole || !req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    req.user.role = freshRole;

    const userId = req.user.id;
    const userRole = req.user.role;

    const {
      teamId,
      startDate,
      endDate,
      halfDay,
      type,
      description,
    }: CreateDayOffRequest = req.body;

    const validated = ValidateRequest.safeParse({
      teamId,
      userRole,
      startDate,
      endDate,
      halfDay,
      type,
      description,
    });

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Вхідні дані містять помилку",
        errors: z.flattenError(validated.error),
      });
    }

    const data = validated.data;

    if (data.startDate > data.endDate) {
      return res.status(400).json({
        success: false,
        message: "Дата початку не може бути пізніше за кінцеву дату",
      });
    }

    if (data.halfDay && data.startDate !== data.endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Дати початку та кінця повинні бути однакові якщо обрано опцію 'Половина дня'",
      });
    }

    const request = await createRequestService({
      userId,
      userRole: data.userRole,
      teamId: data.teamId,
      startDate: data.startDate,
      endDate: data.endDate,
      halfDay: data.halfDay,
      type: data.type,
      description: data.description,
    });

    if (!request) {
      return res.status(500).json({
        success: false,
        message: "Помилка створення запиту",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Запит успішно створено",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const freshRole = await getCurrentUserRole(req.user?.id);

    if (!freshRole || !req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    req.user.role = freshRole;

    const userId = req.user.id;
    const userRole = req.user.role;

    const { requestId } = req.params;

    const validated = GetRequest.safeParse({ requestId, userRole });

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Вхідні дані містять помилку",
        errors: z.flattenError(validated.error),
      });
    }

    const request = await getRequestService({
      userId,
      requestId: validated.data.requestId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Запит не знайдено",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Запит знайдено успішно",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    const { status, authorId, type, teamId } = req.query;
    const freshRole = await getCurrentUserRole(
      req.user.id,
      typeof teamId === "string" ? teamId : undefined
    );

    if (!freshRole) {
      return res.sendStatus(204);
    }

    req.user.role = freshRole;

    const userId = req.user.id;
    const userRole = req.user.role;

    const validated = GetRequests.safeParse({ status, authorId, type, teamId });

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Вхідні дані містять помилку",
        errors: z.flattenError(validated.error),
      });
    }

    if (
      !status &&
      !authorId &&
      !type &&
      !["super", "admin"].includes(userRole)
    ) {
      return res.status(403).json({
        success: false,
        message: "Немає доступу для отримання даних",
      });
    }

    const data = validated.data;

    if (authorId) {
      if (
        mongoose.isValidObjectId(authorId) &&
        mongoose.isValidObjectId(userId)
      ) {
        if (
          !new mongoose.Types.ObjectId(data.authorId).equals(
            new mongoose.Types.ObjectId(userId)
          ) &&
          !["super", "admin"].includes(userRole)
        ) {
          return res.status(403).json({
            success: false,
            message: "Немає доступу для отримання даних",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Ідентифікатор користувача недійсний",
        });
      }
    } else if (!["super", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Немає доступу для отримання даних",
      });
    }

    const requests = await getRequestsService({
      status: data.status,
      authorId: data.authorId,
      type: data.type,
      teamId: data.teamId,
      requesterId: userId,
    });

    if (!Array.isArray(requests)) {
      return res.status(500).json({
        success: false,
        message: "Помилка отримання запитів",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Запити успішно отримані",
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const patchMarkRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const freshRole = await getCurrentUserRole(req.user?.id);

    if (!freshRole || !req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    req.user.role = freshRole;

    if (!["super", "admin"].includes(freshRole)) {
      return res.status(403).json({
        success: false,
        message: "Немає доступу для зміни даних",
      });
    }

    const { newStatus } = req.body;
    const { requestId } = req.params;

    const validated = PatchMarkRequest.safeParse({
      newStatus,
      requestId,
      reviewerId: req.user.id,
    });

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Вхідні дані містять помилку",
        errors: z.flattenError(validated.error),
      });
    }

    const { updatedRequest, updatedTeamMember } = await patchMarkRequestService(
      {
        newStatus: validated.data.newStatus,
        requestId: validated.data.requestId,
        reviewerId: validated.data.reviewerId,
      }
    );

    if (!updatedRequest || !updatedTeamMember) {
      return res.status(500).json({
        success: false,
        message: "Помилка оновлення статусу запиту",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Статус запиту успішно оновлено",
      updatedRequest,
      updatedTeamMember,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRemains = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const freshRole = await getCurrentUserRole(req.user?.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Потрібно авторизуватись",
      });
    }

    if (!freshRole) {
      return res.sendStatus(204);
    }

    req.user.role = freshRole;

    const userId = req.user.id;
    const userRole = req.user.role;
    const teamId = typeof req.query.teamId === "string"
      ? req.query.teamId
      : "";

    const validated = GetRemains.safeParse({ userId, teamId, userRole });

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Вхідні дані містять помилку",
        errors: z.flattenError(validated.error),
      });
    }

    const remains = await getRemainsService({
      userId: validated.data.userId,
      teamId: validated.data.teamId,
    });

    return res.status(200).json({
      success: true,
      message: "Залишки отримано успішно",
      remains,
    });
  } catch (error) {
    next(error);
  }
};
