"use client";

import { deleteTeam, editTeam } from "@/app/(protected)/dashboard/actions";
import { CurrentUser, EditTeam2, ExpandedTeamResponse } from "@/types/types";
import { useActionState, useEffect, useState } from "react";
import {
  EMAIL_REGEX,
  MEMBER_EMAIL_EMPTY_ERROR,
  MEMBER_EMAIL_REGEX_ERROR,
} from "@/constants/constants";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/app/components/Loader/Loader";

type PendingMember = {
  email: string;
  role: "admin" | "worker";
};

export default function Team({
  team,
  user,
}: Pick<ExpandedTeamResponse, "team"> & { user: CurrentUser }) {
  const router = useRouter();
  const [updateState, editFormAction, isEditPending] = useActionState(
    editTeam,
    {}
  );
  const [confirmTeamDeleteDialogOpen, setConfirmTeamDeleteDialogOpen] =
    useState(false);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteTeam,
    {}
  );
  const updateFieldErrors = Array.isArray(updateState.error)
    ? Object.assign({}, ...updateState.error)
    : {};

  const [formData, setFormData] = useState<EditTeam2>({
    id: team._id,
    title: team.title,
    maxDayOffs: team.maxOff,
    maxSick: team.maxSick,
    system: team.system,
    members: team.members,
  });
  const [memberEmail, setMemberEmail] = useState("");
  const [showMemberEmailError, setShowMemberEmailError] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);

  useEffect(() => {
    if (!deleteState.success) {
      return;
    }

    router.replace("/dashboard");
  }, [router, deleteState]);

  useEffect(() => {
    if (updateState.success) {
      router.refresh();
    }
  }, [router, updateState]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      id: team._id,
      title: team.title,
      maxDayOffs: team.maxOff,
      maxSick: team.maxSick,
      system: team.system,
      members: team.members,
    });
    setPendingMembers([]);
  }, [team]);

  useEffect(() => {
    document.body.classList.toggle(
      "overflow-hidden",
      confirmTeamDeleteDialogOpen
    );

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [confirmTeamDeleteDialogOpen]);

  const handleFormDataChange = (type: string, value: string | number) => {
    if (type in formData) {
      if (type !== "members") {
        setFormData((prev) => {
          return { ...prev, [type]: value };
        });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50">
      {(isEditPending || isDeletePending) && <Loader />}
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-4 bg-white py-16 sm:items-start">
        <h1 className="text-2xl font-bold">{team.title}</h1>
        <section className="w-full rounded-md bg-teal-950 p-1 md:p-3 text-white">
          <form
            action={editFormAction}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-2">
              <input type="hidden" name="id" value={formData.id ?? ""} />
              <label className="flex flex-col gap-1">
                Назва
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  placeholder="Введіть назву команди"
                  onChange={(e) => {
                    e.preventDefault();

                    handleFormDataChange("title", e.target.value);
                  }}
                  className="w-full border border-zinc-400 rounded-md outline-none p-2"
                />
                {updateFieldErrors.title && (
                  <p className="text-xs text-red-600">
                    {updateFieldErrors.title}
                  </p>
                )}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість вихідних
                  <input
                    type="number"
                    name="maxDayOffs"
                    min={0}
                    required
                    value={formData.maxDayOffs < 0 ? 0 : formData.maxDayOffs}
                    onChange={(e) => {
                      e.preventDefault();

                      handleFormDataChange(
                        "maxDayOffs",
                        Number(e.target.value)
                      );
                    }}
                    className="w-full border border-zinc-400 rounded-md outline-none p-2"
                  />
                  {updateFieldErrors.maxDayOffs && (
                    <p className="text-xs text-red-600">
                      {updateFieldErrors.maxDayOffs}
                    </p>
                  )}
                </label>
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість лікарняних
                  <input
                    type="number"
                    name="maxSick"
                    min={0}
                    required
                    value={formData.maxSick < 0 ? 0 : formData.maxSick}
                    onChange={(e) => {
                      e.preventDefault();

                      handleFormDataChange("maxSick", Number(e.target.value));
                    }}
                    className="w-full border border-zinc-400 rounded-md outline-none p-2"
                  />
                  {updateFieldErrors.maxSick && (
                    <p className="text-xs text-red-600">
                      {updateFieldErrors.maxSick}
                    </p>
                  )}
                </label>
              </div>
              <label className="flex flex-col gap-1">
                Тип накопичення вихідних
                <select
                  name="system"
                  value={formData.system}
                  onChange={(e) =>
                    handleFormDataChange("system", e.target.value)
                  }
                  className="w-full border border-zinc-400 rounded-md bg-teal-950 p-2 text-white outline-none"
                >
                  <option className="bg-white text-zinc-900" value="all-in">
                    Повний (усі вихідні доступні одразу)
                  </option>
                  <option className="bg-white text-zinc-900" value="accum">
                    Накопичувальний (вихідні додаються кожного місяця)
                  </option>
                </select>
                {updateFieldErrors.system && (
                  <p className="text-xs text-red-600">
                    {updateFieldErrors.system}
                  </p>
                )}
              </label>
              <label className="flex flex-col gap-1">
                Додати учасника (необов&apos;язково)
                <div className="flex justify-between gap-3">
                  {formData.members.map((member) => (
                    <input
                      key={member.memberId.email}
                      type="hidden"
                      name="members"
                      value={JSON.stringify({
                        email: member.memberId.email,
                        role: member.role,
                      })}
                    />
                  ))}
                  {pendingMembers.map((member) => (
                    <input
                      key={member.email}
                      type="hidden"
                      name="members"
                      value={JSON.stringify(member)}
                    />
                  ))}
                  <input
                    type="text"
                    name="member"
                    value={memberEmail}
                    placeholder="Введіть електронну пошту учасника"
                    onChange={(e) => {
                      e.preventDefault();

                      setMemberEmail(e.target.value);
                      setShowMemberEmailError(false);
                    }}
                    className="w-full border border-zinc-400 
                      rounded-md outline-none p-2"
                  />
                  <button
                    type="button"
                    className="bg-white hover:bg-gray-300 text-black font-bold 
                      px-4 py-1 rounded-md transition-all cursor-pointer duration-200"
                    onClick={() => {
                      const email = memberEmail.trim();
                      const isAlreadyMember = formData.members.some(
                        (member) => member.memberId.email === email
                      );
                      const isPending = pendingMembers.some(
                        (member) => member.email === email
                      );

                      if (
                        EMAIL_REGEX.test(email) &&
                        !isAlreadyMember &&
                        !isPending
                      ) {
                        setPendingMembers((previous) => [
                          ...previous,
                          { email, role: "worker" },
                        ]);
                        setShowMemberEmailError(false);
                        setMemberEmail("");
                      } else {
                        setShowMemberEmailError(true);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </label>
              <span className="hidden md:block text-xs">
                Введіть електронну пошту учасника та натисніть кнопку +
              </span>
              {showMemberEmailError && (
                <p className="font-bold text-red-600">
                  {memberEmail.trim().length === 0
                    ? MEMBER_EMAIL_EMPTY_ERROR
                    : MEMBER_EMAIL_REGEX_ERROR}
                </p>
              )}
              <div>
                <h2 className="text-xl font-bold">Учасники</h2>
                {formData.members.length === 0 &&
                pendingMembers.length === 0 ? (
                  <div className="w-full flex justify-center items-center h-48">
                    <span className="text-center text-xl font-semibold">
                      У цієї команди поки що немає учасників
                    </span>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {formData.members.map((member) => (
                      <li
                        key={member.memberId.email}
                        className="rounded-md bg-teal-800 transition-colors duration-150 p-3 flex flex-col md:flex-row md:items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">
                            {member.memberId.firstName}{" "}
                            {member.memberId.lastName}
                            {member.memberId.email === user.email && " (ви)"}
                          </p>
                          <p className="text-sm text-teal-100">
                            {member.memberId.email}
                          </p>
                        </div>
                        {member.memberId.email !== user.email ? (
                          <div className="flex gap-3 items-center justify-between">
                            <label className="flex flex-col gap-1">
                              Роль
                              <select
                                value={member.role}
                                disabled={isEditPending}
                                onChange={(e) => {
                                  setFormData((previous) => ({
                                    ...previous,
                                    members: previous.members.map(
                                      (currentMember) =>
                                        currentMember.memberId._id ===
                                        member.memberId._id
                                          ? {
                                              ...currentMember,
                                              role: e.target.value,
                                            }
                                          : currentMember
                                    ),
                                  }));
                                }}
                                className="w-full border border-zinc-400 rounded-md bg-teal-950 p-2 text-white outline-none"
                              >
                                <option value="admin">
                                  Адміністратор команди
                                </option>
                                <option value="worker">Працівник</option>
                              </select>
                            </label>
                            <button
                              type="button"
                              className="bg-red-900 hover:bg-red-800 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
                              onClick={() => {
                                setFormData((previous) => ({
                                  ...previous,
                                  members: previous.members.filter(
                                    (currentMember) =>
                                      currentMember.memberId.email !==
                                      member.memberId.email
                                  ),
                                }));
                              }}
                            >
                              <Trash />
                            </button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                    {pendingMembers.map((member) => (
                      <li
                        key={member.email}
                        className="rounded-md bg-teal-800 transition-colors duration-150 p-3 flex flex-col md:flex-row md:items-center justify-between"
                      >
                        <p>{member.email}</p>
                        <div className="flex gap-3 items-center justify-between">
                          <label className="flex flex-col gap-1">
                            Роль
                            <select
                              value={member.role}
                              disabled={isEditPending}
                              onChange={(e) => {
                                setPendingMembers((previous) =>
                                  previous.map((pendingMember) =>
                                    pendingMember.email === member.email
                                      ? {
                                          ...pendingMember,
                                          role: e.target
                                            .value as PendingMember["role"],
                                        }
                                      : pendingMember
                                  )
                                );
                              }}
                              className="w-full border border-zinc-400 rounded-md bg-teal-950 p-2 text-white outline-none"
                            >
                              <option value="admin">
                                Адміністратор команди
                              </option>
                              <option value="worker">Працівник</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            className="bg-red-900 hover:bg-red-800 text-white font-bold px-2 py-2 rounded-md"
                            onClick={() =>
                              setPendingMembers((previous) =>
                                previous.filter(
                                  (pendingMember) =>
                                    pendingMember.email !== member.email
                                )
                              )
                            }
                          >
                            <Trash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="mt-2 h-10 border-none bg-red-900 hover:bg-red-800 text-white md:font-bold rounded-xl 
                    px-1 md:px-3 py-1 transition-all cursor-pointer duration-500"
                  onClick={() => setConfirmTeamDeleteDialogOpen(true)}
                  disabled={isDeletePending}
                >
                  {isDeletePending
                    ? "Видалення команди..."
                    : "Видалити команду"}
                </button>
                <button
                  type="submit"
                  className="mt-2 h-10 border-none bg-white hover:bg-gray-300 text-black rounded-xl 
                  px-1 md:px-3 py-1 transition-all cursor-pointer duration-500 md:font-bold"
                  disabled={isEditPending}
                >
                  {isEditPending ? "Збереження змін..." : "Зберегти зміни"}
                </button>
              </div>
              {typeof updateState.error === "string" && (
                <p className="font-bold text-red-600">{updateState.error}</p>
              )}
            </div>
          </form>
        </section>
      </div>

      {confirmTeamDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-500/80 p-1.5 md:p-4"
          onClick={() => setConfirmTeamDeleteDialogOpen(false)}
        >
          <form
            action={deleteFormAction}
            className="w-full md:w-100 min-w-0 flex flex-col gap-2 border-none rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <input type="hidden" name="id" value={team._id || ""} />
            <div
              className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-5
            "
            >
              <strong>Ви впевнені, що хочете видалити команду?</strong>

              {typeof deleteState.error === "string" && (
                <p className="font-bold text-red-600">{deleteState.error}</p>
              )}

              <div className="flex gap-1 justify-between">
                <button
                  type="button"
                  className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                    px-1 md:px-3 py-1 transition-all cursor-pointer duration-500"
                  disabled={isDeletePending}
                  onClick={() => setConfirmTeamDeleteDialogOpen(false)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="mt-2 h-10 border-none bg-red-900 hover:bg-red-800 text-white rounded-xl 
                    px-1 md:px-3 py-1 transition-all cursor-pointer duration-500"
                  disabled={isDeletePending}
                >
                  {isDeletePending ? "Видалення..." : "Видалити"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
