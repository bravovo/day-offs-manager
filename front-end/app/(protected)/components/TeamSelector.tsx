"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeamOption {
  _id: string;
  title: string;
}

export default function TeamSelector({
  teams,
  selectedTeamId,
}: {
  teams: TeamOption[];
  selectedTeamId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const savedTeamId = window.localStorage.getItem("selectedTeamId");

    if (!savedTeamId) {
      window.localStorage.setItem("selectedTeamId", selectedTeamId);
      return;
    }

    if (
      savedTeamId !== selectedTeamId &&
      teams.some((team) => team._id === savedTeamId)
    ) {
      router.replace(`/dashboard?teamId=${encodeURIComponent(savedTeamId)}`);
    }
  }, [router, selectedTeamId, teams]);

  return (
    <label className="flex w-full max-w-4xl flex-col gap-1 px-4 pt-4 sm:px-0 mb-4">
      <span className="text-sm font-semibold">Команда</span>
      <select
        value={selectedTeamId}
        onChange={(event) => {
          const teamId = event.target.value;
          window.localStorage.setItem("selectedTeamId", teamId);
          router.push(`/dashboard?teamId=${encodeURIComponent(teamId)}`);
        }}
        className="w-full rounded-md border border-zinc-400 p-2 outline-none"
      >
        {teams.map((team) => (
          <option key={team._id} value={team._id}>
            {team.title}
          </option>
        ))}
      </select>
    </label>
  );
}
