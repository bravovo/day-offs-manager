"use client";

import {
  CurrentUserResponse,
  DialogRequest,
  Request,
  Requests as RequestsType,
} from "@/types/types";
import { useActionState, useEffect, useState, useTransition } from "react";
import { createRequest, reviewRequest } from "../requestsActions";
import { useRouter } from "next/navigation";
import { Loader, Plus } from "lucide-react";
import { formatDateInput } from "@/utils/utils";
import ReviewRequestDialog from "./ReviewRequestDialog";

export interface RequestsProps {
  userRequests: RequestsType;
  adminRequests: RequestsType | null;
  canReviewRequests: boolean;
  userResponse: CurrentUserResponse;
}

export default function Requests({
  userRequests,
  adminRequests,
  canReviewRequests,
  userResponse,
}: RequestsProps) {
  const router = useRouter();
  const [createState, formAction, isCreatePending] = useActionState(
    createRequest,
    {}
  );
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    reviewRequest,
    {}
  );
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRequestData, setReviewRequestData] = useState<Request | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateErrors, setShowCreateErrors] = useState(false);
  const [dialogData, setDialogData] = useState<DialogRequest>({
    status: "pending",
    type: "day",
    teamId: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    userId: "",
    halfDay: false,
    description: "",
  });

  useEffect(() => {
    if (createState.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateErrors(true);
    }
  }, [createState.error]);

  useEffect(() => {
    if (!createState.success) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRefreshing(true);
    setDialogData({
      status: "pending",
      type: "day",
      teamId: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      userId: "",
      halfDay: false,
      description: "",
    });
    setShowCreateErrors(false);
    setCreateDialogOpen(false);
    router.refresh();
  }, [router, createState]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRefreshing(false);
  }, [userRequests]);

  useEffect(() => {
    if (!reviewState.success) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReviewDialogOpen(false);
    setReviewRequestData(null);
    router.refresh();
  }, [reviewState.success, router]);

  const fieldErrors =
    createState.error && typeof createState.error === "object"
      ? createState.error
      : {};

  const reviewRequests =
    adminRequests?.filter(
      (request) =>
        String(request.userId) !== String(userResponse.user._id) ||
        userResponse.userRole === "super"
    ) ?? [];

  const openCreateDialog = () => {
    setDialogData({
      status: "pending",
      type: "day",
      teamId: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      userId: "",
      halfDay: false,
      description: "",
    });
    setShowCreateErrors(false);
    setCreateDialogOpen(true);
  };

  const handleDialogDataChange = (
    type: string,
    value: string | number | Date
  ) => {
    setDialogData((prev) => {
      return { ...prev, [type]: value };
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50">
      {(isCreatePending || isRefreshing) && <Loader />}
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-4 bg-white py-16 sm:items-start">
        {canReviewRequests && adminRequests && (
          <div className="w-full">
            <div className="flex justify-between items-center gap-5">
              <h2 className="text-xl font-bold">
                Запити, що очікують на вашу перевірку
              </h2>{" "}
            </div>
            <div className="w-full rounded-md bg-teal-950 p-3 text-white mt-3">
              {reviewRequests.length === 0 ? (
                <div className="w-full flex justify-center items-center p-5 h-48">
                  <div className="mt-3 text-center">
                    <span className="text-xl font-semibold">
                      Всі запити перевірені
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviewRequests.map((req) => {
                    return (
                      <div
                        key={req._id}
                        onClick={() => {
                          setReviewRequestData(req);
                          setReviewDialogOpen(true);
                        }}
                        className={`h-40 rounded-xl p-4 shadow-sm flex items-start justify-between gap-2 ${
                          req.status === "pending"
                            ? "bg-gray-100"
                            : req.status === "approved"
                              ? "bg-green-200"
                              : "bg-amber-200"
                        }`}
                      >
                        <div className="w-full text-sm text-gray-700">
                          <div className="font-semibold text-gray-900 flex items-center justify-between">
                            {req.type === "day" ? "Відпустка" : "Лікарняний"}
                            {req.halfDay && (
                              <span className="shrink-0 rounded-full bg-teal-700 px-2 py-0.5 text-xs text-white">
                                Половина дня
                              </span>
                            )}
                          </div>
                          {req.author &&
                            (String(req.author._id) ===
                            String(userResponse.user._id) ? (
                              <div className="mt-1 text-xs font-bold">
                                Автор: Ви
                              </div>
                            ) : (
                              <div className="mt-1 text-xs font-bold">
                                {req.author.firstName} {req.author.lastName} (
                                <a
                                  href={`mailto:${req.author.email}`}
                                  className="underline"
                                >
                                  {req.author.email}
                                </a>
                                )
                              </div>
                            ))}
                          <div className="mt-1">
                            {
                              new Date(req.startDate)
                                .toISOString()
                                .split("T")[0]
                            }{" "}
                            →{" "}
                            {new Date(req.endDate).toISOString().split("T")[0]}
                          </div>
                          {req.description && (
                            <p
                              title={req.description}
                              className="mt-2 border-t pt-2 text-black wrap-break-word line-clamp-2"
                            >
                              {req.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full">
          <div className="flex justify-between items-center gap-5">
            <h2 className="text-xl font-bold">Ваші запити</h2>{" "}
            {userRequests.length > 0 && (
              <button
                className="bg-teal-800 hover:bg-teal-700 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
                onClick={openCreateDialog}
              >
                <Plus className="hover:rotate-90 duration-500" />
              </button>
            )}
          </div>
          <div className="w-full rounded-md bg-teal-950 p-3 text-white mt-3">
            {userRequests.length === 0 ? (
              <div className="w-full flex justify-center items-center p-5 h-48">
                <div className="mt-3 text-center">
                  <span className="text-xl font-semibold">
                    У вас поки немає створених запитів на відпустку або
                    лікарняний
                  </span>
                  <br />
                  <button
                    className="text-blue-400 underline cursor-pointer"
                    onClick={openCreateDialog}
                  >
                    Створіть один
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userRequests.map((req) => (
                  <div
                    key={req._id}
                    className={`h-40 rounded-xl p-4 shadow-sm flex items-start justify-between gap-2 ${
                      req.status === "pending"
                        ? "bg-gray-100"
                        : req.status === "approved"
                          ? "bg-green-200"
                          : "bg-amber-200"
                    }`}
                  >
                    <div className="w-full text-sm text-gray-700">
                      <div className="font-semibold text-gray-900 flex items-center justify-between">
                        {req.type === "day" ? "Відпустка" : "Лікарняний"}
                        {req.halfDay && (
                          <span className="shrink-0 rounded-full bg-teal-700 px-2 py-0.5 text-xs text-white">
                            Половина дня
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs font-bold">
                        {req.reviewedBy &&
                          (String(req.reviewedBy._id) ===
                          String(userResponse.user._id) ? (
                            <div className="mt-1">
                              Ви{" "}
                              {req.status === "approved"
                                ? "погодили"
                                : "відхилили"}{" "}
                              цей запит
                            </div>
                          ) : (
                            <div className="mt-1 text-xs font-bold">
                              {req.status === "approved"
                                ? "Погодив"
                                : "Відхилив"}
                              {": "}
                              {req.reviewedBy.firstName}{" "}
                              {req.reviewedBy.lastName} (
                              <a
                                href={`mailto:${req.reviewedBy.email}`}
                                className="underline"
                              >
                                {req.reviewedBy.email}
                              </a>
                              )
                            </div>
                          ))}
                      </div>
                      <div className="mt-1">
                        {new Date(req.startDate).toISOString().split("T")[0]} →{" "}
                        {new Date(req.endDate).toISOString().split("T")[0]}
                      </div>
                      {req.description && (
                        <p
                          title={req.description}
                          className="mt-2 border-t pt-2 text-black wrap-break-word line-clamp-2"
                        >
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {createDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/80 p-1.5 md:p-4"
            onClick={() => {
              setShowCreateErrors(false);
              setCreateDialogOpen(false);
            }}
          >
            <form
              className="w-full md:w-md min-w-0 max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col gap-2 border-none rounded-2xl bg-white text-zinc-950"
              onSubmit={(event) => {
                event.preventDefault();
                setShowCreateErrors(true);

                const formData = new FormData(event.currentTarget);
                startSubmitTransition(() => {
                  formAction(formData);
                });
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-2">
                <input
                  type="hidden"
                  name="teamId"
                  value={userResponse.teamId ?? ""}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="min-w-0 flex flex-col gap-1">
                    Дата початку
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formatDateInput(dialogData.startDate)}
                      onChange={(e) => {
                        e.preventDefault();

                        handleDialogDataChange(
                          "startDate",
                          new Date(`${e.target.value}T00:00:00`)
                        );
                      }}
                      className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                    />
                    {showCreateErrors && fieldErrors.startDate && (
                      <p className="text-xs text-red-600">
                        {fieldErrors.startDate}
                      </p>
                    )}
                  </label>
                  <label className="min-w-0 flex flex-col gap-1">
                    Дата кінця
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={formatDateInput(dialogData.endDate)}
                      onChange={(e) => {
                        e.preventDefault();

                        handleDialogDataChange(
                          "endDate",
                          new Date(`${e.target.value}T00:00:00`)
                        );
                      }}
                      className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                    />
                    {showCreateErrors && fieldErrors.endDate && (
                      <p className="text-xs text-red-600">
                        {fieldErrors.endDate}
                      </p>
                    )}
                  </label>
                </div>
                <label className="flex flex-row items-center gap-1 w-fit">
                  Половина дня
                  <input
                    type="checkbox"
                    name="halfDay"
                    checked={dialogData.halfDay}
                    onChange={() => {
                      setDialogData((prev) => {
                        return { ...prev, halfDay: !prev.halfDay };
                      });
                    }}
                    className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none"
                  />
                  {showCreateErrors && fieldErrors.halfDay && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.halfDay}
                    </p>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  Тип запиту
                  <select
                    name="type"
                    value={dialogData.type}
                    required
                    onChange={(e) =>
                      handleDialogDataChange("type", e.target.value)
                    }
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  >
                    <option value="day">Вихідний (відпустка)</option>
                    <option value="sick">Лікарняний</option>
                  </select>
                  {showCreateErrors && fieldErrors.type && (
                    <p className="text-xs text-red-600">{fieldErrors.type}</p>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  Опис
                  <textarea
                    name="description"
                    value={dialogData.description}
                    onChange={(e) => {
                      e.preventDefault();

                      handleDialogDataChange("description", e.target.value);
                    }}
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  />
                  {showCreateErrors && fieldErrors.description && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.description}
                    </p>
                  )}
                </label>

                <button
                  type="submit"
                  className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
                  disabled={isCreatePending || isSubmitting}
                >
                  {isCreatePending || isSubmitting
                    ? "Створення запиту..."
                    : "Створити запит"}
                </button>
                {showCreateErrors &&
                  createState.error &&
                  typeof createState.error === "string" && (
                    <p className="font-bold text-red-600">
                      {createState.error}
                    </p>
                  )}
              </div>
            </form>
          </div>
        )}

        {reviewDialogOpen && reviewRequestData && (
          <ReviewRequestDialog
            open={reviewDialogOpen}
            action={reviewAction}
            isPending={isReviewPending}
            onClose={() => {
              setReviewDialogOpen(false);
              setReviewRequestData(null);
            }}
            canReviewRequest={canReviewRequests}
            request={reviewRequestData}
          />
        )}
      </div>
    </div>
  );
}
