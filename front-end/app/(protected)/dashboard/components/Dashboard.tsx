"use client";

import { Loader } from "@/app/components/Loader/Loader";
import { CreateTeam, TeamsResponse } from "@/types/types";
import { useActionState, useEffect, useState } from "react";
import {
  createTeam,
  deleteTeam,
  editTeam,
} from "@/app/(protected)/dashboard/actions";
import { EMAIL_REGEX } from "@/constants/constants";
import { useRouter } from "next/navigation";
import { Plus, Settings, Trash } from "lucide-react";

const MEMBER_EMAIL_REGEX_ERROR = "Електрона пошта учасника не правильна";
const MEMBER_EMAIL_EMPTY_ERROR = "Потрібно ввести електронну пошту учасника";

export function Dashboard({ teams }: Pick<TeamsResponse, "teams">) {
  const router = useRouter();
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [confirmTeamDeleteDialogOpen, setConfirmTeamDeleteDialogOpen] =
    useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [teamToEdit, setTeamToEdit] = useState(teams[0]);
  const [state, formAction, isPending] = useActionState(createTeam, {});
  const [updateState, editFormAction, isEditPending] = useActionState(
    editTeam,
    {}
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteTeam,
    {}
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dialogData, setDialogData] = useState<CreateTeam>({
    id: undefined,
    title: "",
    maxDayOffs: 0,
    maxSick: 0,
    system: "all-in",
    members: [],
  });
  const [memberEmail, setMemberEmail] = useState("");
  const [showMemberEmailError, setShowMemberEmailError] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!state.success) {
      return;
    }

    setIsRefreshing(true);
    setDialogData({
      id: undefined,
      title: "",
      maxDayOffs: 0,
      maxSick: 0,
      system: "all-in",
      members: [],
    });
    setMemberEmail("");
    setShowMemberEmailError(false);
    setCreateTeamDialogOpen(false);
    router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (!updateState.success) {
      return;
    }

    setIsRefreshing(true);
    setDialogData({
      id: undefined,
      title: "",
      maxDayOffs: 0,
      maxSick: 0,
      system: "all-in",
      members: [],
    });
    setMemberEmail("");
    setShowMemberEmailError(false);
    setEditTeamDialogOpen(false);
    router.refresh();
  }, [router, updateState]);

  useEffect(() => {
    if (!deleteState.success) {
      return;
    }

    setIsRefreshing(true);
    setConfirmTeamDeleteDialogOpen(false);
    router.refresh();
  }, [router, deleteState]);

  useEffect(() => {
    setIsRefreshing(false);
  }, [teams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDialogDataChange = (type: string, value: string | number) => {
    if (type in dialogData) {
      if (type === "members" && typeof value === "string") {
        setDialogData((prev) => {
          return { ...prev, members: [...prev.members, value] };
        });
      } else {
        setDialogData((prev) => {
          return { ...prev, [type]: value };
        });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50">
      {(isPending || isRefreshing) && <Loader />}
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-4 bg-white py-16 sm:items-start">
        <h1 className="text-2xl font-bold">Робоче середовище</h1>
        <section className="w-full rounded-md bg-teal-950 p-3 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Створенні Команди</h2>{" "}
            <button
              className="bg-teal-800 hover:bg-teal-700 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
              onClick={() => setCreateTeamDialogOpen(true)}
            >
              <Plus className="hover:rotate-90 duration-500" />
            </button>
          </div>
          {teams.length === 0 ? (
            <div className="w-full flex justify-center items-center p-5 h-48">
              <div className="mt-3 text-center">
                <span className="text-xl font-semibold">
                  У вас поки немає команд
                </span>
                <br />
                <button
                  className="text-blue-400 underline cursor-pointer"
                  onClick={() => setCreateTeamDialogOpen(true)}
                >
                  Створіть одну
                </button>
              </div>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {teams.map((team) => (
                <li
                  key={team._id}
                  className="rounded-md bg-teal-800 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{team.title}</p>
                    <p className="text-sm text-teal-100">
                      Учасників: {team.members.length}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="bg-red-900 hover:bg-red-800 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
                      onClick={() => {
                        setConfirmTeamDeleteDialogOpen(true);
                        setTeamToDelete(team._id);
                      }}
                    >
                      <Trash />
                    </button>
                    <button
                      className="bg-teal-900 hover:bg-teal-700 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
                      onClick={() => {
                        setTeamToEdit(team);
                        setDialogData({
                          id: team._id,
                          title: team.title,
                          maxDayOffs: team.maxOff,
                          maxSick: team.maxSick,
                          system: team.system,
                          members: [],
                        });
                        setEditTeamDialogOpen(true);
                      }}
                    >
                      <Settings className="hover:rotate-180 duration-500" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {createTeamDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-500/80 p-1.5 md:p-4"
          onClick={() => setCreateTeamDialogOpen(false)}
        >
          <form
            action={formAction}
            className="w-full md:w-md min-w-0 flex flex-col gap-2 border-none rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                Назва
                <input
                  type="text"
                  name="title"
                  required
                  value={dialogData.title}
                  placeholder="Введіть назву команди"
                  onChange={(e) => {
                    e.preventDefault();

                    handleDialogDataChange("title", e.target.value);
                  }}
                  className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість вихідних
                  <input
                    type="number"
                    name="maxDayOffs"
                    min={0}
                    required
                    value={
                      dialogData.maxDayOffs < 0 ? 0 : dialogData.maxDayOffs
                    }
                    onChange={(e) => {
                      e.preventDefault();

                      handleDialogDataChange(
                        "maxDayOffs",
                        Number(e.target.value)
                      );
                    }}
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  />
                </label>
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість лікарняних
                  <input
                    type="number"
                    name="maxSick"
                    min={0}
                    required
                    value={dialogData.maxSick < 0 ? 0 : dialogData.maxSick}
                    onChange={(e) => {
                      e.preventDefault();

                      handleDialogDataChange("maxSick", Number(e.target.value));
                    }}
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                Тип накопичення вихідних
                <select
                  name="system"
                  value={dialogData.system}
                  onChange={(e) =>
                    handleDialogDataChange("system", e.target.value)
                  }
                  className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                >
                  <option value="all-in">
                    Повний (усі вихідні доступні одразу)
                  </option>
                  <option value="accum">
                    Накопичувальний (вихідні додаються кожного місяця)
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Додати учасника (необов&apos;язково)
                <div className="flex justify-between gap-3">
                  {dialogData.members.map((member) => (
                    <input
                      key={member}
                      type="hidden"
                      name="members"
                      value={member}
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
                    className="w-full border border-zinc-400 focus:border-teal-950 
                      rounded-md outline-none p-2"
                  />
                  <button
                    type="button"
                    className="bg-teal-950 hover:bg-teal-800 text-white font-bold 
                      px-2 py-1 rounded-md transition-all cursor-pointer duration-200"
                    onClick={() => {
                      if (EMAIL_REGEX.test(memberEmail.trim())) {
                        handleDialogDataChange("members", memberEmail);
                        setShowMemberEmailError(false);
                        setMemberEmail("");
                      } else {
                        setShowMemberEmailError(true);
                      }
                    }}
                  >
                    <Plus className="hover:rotate-90 duration-500" />
                  </button>
                </div>
              </label>
              <span className="text-xs">
                Введіть електронну пошту учасника та натисніть кнопку +
              </span>
              {showMemberEmailError && (
                <p className="font-bold text-red-600">
                  {memberEmail.trim().length === 0
                    ? MEMBER_EMAIL_EMPTY_ERROR
                    : MEMBER_EMAIL_REGEX_ERROR}
                </p>
              )}
              {dialogData.members.length > 0 && (
                <label
                  className="flex flex-col gap-1 border border-teal-950 px-2 py-2 
                  font-semibold rounded-md"
                >
                  Учасники
                  <span className="font-normal">
                    {dialogData.members.join(", ")}
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
                disabled={isPending}
              >
                {isPending ? "Створення команди..." : "Створити команду"}
              </button>
              {state.error && (
                <p className="font-bold text-red-600">{state.error}</p>
              )}
            </div>
          </form>
        </div>
      )}

      {teamToEdit && editTeamDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-500/80 p-1.5 md:p-4"
          onClick={() => setEditTeamDialogOpen(false)}
        >
          <form
            action={editFormAction}
            className="w-full md:w-md min-w-0 flex flex-col gap-2 border-none rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-2">
              <input type="hidden" name="id" value={dialogData.id ?? ""} />
              <label className="flex flex-col gap-1">
                Назва
                <input
                  type="text"
                  name="title"
                  required
                  value={dialogData.title}
                  placeholder="Введіть назву команди"
                  onChange={(e) => {
                    e.preventDefault();

                    handleDialogDataChange("title", e.target.value);
                  }}
                  className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість вихідних
                  <input
                    type="number"
                    name="maxDayOffs"
                    min={0}
                    required
                    value={
                      dialogData.maxDayOffs < 0 ? 0 : dialogData.maxDayOffs
                    }
                    onChange={(e) => {
                      e.preventDefault();

                      handleDialogDataChange(
                        "maxDayOffs",
                        Number(e.target.value)
                      );
                    }}
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  />
                </label>
                <label className="min-w-0 flex flex-col gap-1">
                  Кількість лікарняних
                  <input
                    type="number"
                    name="maxSick"
                    min={0}
                    required
                    value={dialogData.maxSick < 0 ? 0 : dialogData.maxSick}
                    onChange={(e) => {
                      e.preventDefault();

                      handleDialogDataChange("maxSick", Number(e.target.value));
                    }}
                    className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                Тип накопичення вихідних
                <select
                  name="system"
                  value={dialogData.system}
                  onChange={(e) =>
                    handleDialogDataChange("system", e.target.value)
                  }
                  className="w-full border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
                >
                  <option value="all-in">
                    Повний (усі вихідні доступні одразу)
                  </option>
                  <option value="accum">
                    Накопичувальний (вихідні додаються кожного місяця)
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Додати учасника (необов&apos;язково)
                <div className="flex justify-between gap-3">
                  {dialogData.members.map((member) => (
                    <input
                      key={member}
                      type="hidden"
                      name="members"
                      value={member}
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
                    className="w-full border border-zinc-400 focus:border-teal-950 
                      rounded-md outline-none p-2"
                  />
                  <button
                    type="button"
                    className="bg-teal-950 hover:bg-teal-800 text-white font-bold 
                      px-4 py-1 rounded-md transition-all cursor-pointer duration-200"
                    onClick={() => {
                      if (EMAIL_REGEX.test(memberEmail.trim())) {
                        handleDialogDataChange("members", memberEmail);
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
              <span className="text-xs">
                Введіть електронну пошту учасника та натисніть кнопку +
              </span>
              {showMemberEmailError && (
                <p className="font-bold text-red-600">
                  {memberEmail.trim().length === 0
                    ? MEMBER_EMAIL_EMPTY_ERROR
                    : MEMBER_EMAIL_REGEX_ERROR}
                </p>
              )}
              {dialogData.members.length > 0 && (
                <label
                  className="flex flex-col gap-1 border border-teal-950 px-2 py-2 
                  font-semibold rounded-md"
                >
                  Учасники
                  <span className="font-normal">
                    {dialogData.members.join(", ")}
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500"
                disabled={isEditPending}
              >
                {isEditPending ? "Збереження змін..." : "Зберегти зміни"}
              </button>
              {updateState.error && (
                <p className="font-bold text-red-600">{updateState.error}</p>
              )}
            </div>
          </form>
        </div>
      )}

      {teamToDelete && confirmTeamDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-500/80 p-1.5 md:p-4"
          onClick={() => setConfirmTeamDeleteDialogOpen(false)}
        >
          <form
            action={deleteFormAction}
            className="w-full md:w-100 min-w-0 flex flex-col gap-2 border-none rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <input type="hidden" name="id" value={teamToDelete || ""} />
            <div
              className="w-full min-w-0 px-4 md:px-7 py-4 flex flex-col gap-5
            "
            >
              <strong>Ви впевнені, що хочете видалити команду?</strong>

              {deleteState.error && (
                <p className="font-bold text-red-600">{deleteState.error}</p>
              )}

              <div className="flex gap-1 justify-between">
                <button
                  type="button"
                  className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                    px-3 py-1 transition-all cursor-pointer duration-500"
                  disabled={isDeletePending}
                  onClick={() => setConfirmTeamDeleteDialogOpen(false)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="mt-2 h-10 border-none bg-red-900 hover:bg-red-800 text-white rounded-xl 
                    px-3 py-1 transition-all cursor-pointer duration-500"
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
