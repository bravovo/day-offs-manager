import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { TeamsResponse } from "@/types/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Робоче середовище",
  description: "Керуйте своїми командами та відпустками",
};

export default async function Dashboard() {
  const teamsResponse = await authenticatedFetch(`${SERVER_URL}/v1/teams`, {
    cache: "no-store",
  });

  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команди");
  }

  const data: TeamsResponse = await teamsResponse.json();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50">
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-4 bg-white py-16 sm:items-start">
        <h1 className="text-2xl font-bold">Робоче середовище</h1>
        <section className="w-full rounded-md bg-teal-950 p-3 text-white">
          <h2 className="text-xl font-bold">Команди</h2>
          {data.teams.length === 0 ? (
            <div className="w-full flex justify-center items-center p-5 h-48">
              <div className="mt-3 text-center">
                <span className="text-xl font-semibold">
                  У вас поки немає команд
                </span>
                <br />
                {/* TODO додати діалогове вікно створення команди */}
                <button className="text-blue-400 underline cursor-pointer">
                  Створіть одну
                </button>
              </div>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.teams.map((team) => (
                // TODO створити діалогове вікно редагування + запрошення до команди
                <li key={team._id} className="rounded-md bg-teal-800 p-3">
                  <p className="font-semibold">{team.title}</p>
                  <p className="text-sm text-teal-100">
                    Учасників: {team.members.length}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
