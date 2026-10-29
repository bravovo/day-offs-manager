"use client";

import { editTeam } from "@/app/(protected)/dashboard/actions";
import { CurrentUser, EditTeam2, ExpandedTeamResponse } from "@/types/types";
import { useActionState, useState } from "react";
import {
  EMAIL_REGEX,
  MEMBER_EMAIL_EMPTY_ERROR,
  MEMBER_EMAIL_REGEX_ERROR,
} from "@/constants/constants";
import { Settings, Trash } from "lucide-react";

export default function Team({
  team,
  user,
}: Pick<ExpandedTeamResponse, "team"> & { user: CurrentUser }) {
  const [updateState, editFormAction, isEditPending] = useActionState(
    editTeam,
    {}
  );

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
  const [pendingMemberEmails, setPendingMemberEmails] = useState<string[]>([]);

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
      {/* {(isPending || isRefreshing) && <Loader />} */}
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-4 bg-white py-16 sm:items-start">
        <h1 className="text-2xl font-bold">{team.title}</h1>
        <section className="w-full rounded-md bg-teal-950 p-3 text-white">
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
              </label>
              <label className="flex flex-col gap-1">
                Додати учасника (необов&apos;язково)
                <div className="flex justify-between gap-3">
                  {formData.members.map((member) => (
                    <input
                      key={member.memberId.email}
                      type="hidden"
                      name="members"
                      value={member.memberId.email}
                    />
                  ))}
                  {pendingMemberEmails.map((email) => (
                    <input key={email} type="hidden" name="members" value={email} />
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
                      const isPending = pendingMemberEmails.includes(email);

                      if (
                        EMAIL_REGEX.test(email) &&
                        !isAlreadyMember &&
                        !isPending
                      ) {
                        setPendingMemberEmails((previous) => [
                          ...previous,
                          email,
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
              <div>
                <h2 className="text-xl font-bold">Учасники</h2>
                {formData.members.length === 0 &&
                pendingMemberEmails.length === 0 ? (
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
                        className="rounded-md bg-teal-800 transition-colors duration-150 p-3 flex items-center justify-between"
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
                          <div className="flex gap-1">
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
                            <button
                              className="bg-teal-900 hover:bg-teal-700 text-white font-bold px-2 py-2 
                      rounded-md transition-all cursor-pointer duration-200"
                              onClick={() => {
                                // setTeamToEdit(team);
                                // setDialogData({
                                //   id: team._id,
                                //   title: team.title,
                                //   maxDayOffs: team.maxOff,
                                //   maxSick: team.maxSick,
                                //   system: team.system,
                                //   members: [],
                                // });
                                // setEditTeamDialogOpen(true);
                              }}
                            >
                              <Settings className="hover:rotate-180 duration-500" />
                            </button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                    {pendingMemberEmails.map((email) => (
                      <li
                        key={email}
                        className="rounded-md bg-teal-800 transition-colors duration-150 p-3 flex items-center justify-between"
                      >
                        <p>{email}</p>
                        <button
                          type="button"
                          className="bg-red-900 hover:bg-red-800 text-white font-bold px-2 py-2 rounded-md"
                          onClick={() =>
                            setPendingMemberEmails((previous) =>
                              previous.filter(
                                (currentEmail) => currentEmail !== email
                              )
                            )
                          }
                        >
                          <Trash />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="mt-2 h-10 border-none bg-white hover:bg-gray-300 text-black rounded-xl 
                  px-3 py-1 transition-all cursor-pointer duration-500 font-bold"
                disabled={isEditPending}
              >
                {isEditPending ? "Збереження змін..." : "Зберегти зміни"}
              </button>
              {updateState.error && (
                <p className="font-bold text-red-600">{updateState.error}</p>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
