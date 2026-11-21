import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { CurrentUserResponse, TeamsResponse } from "@/types/types";
import { Metadata } from "next";
import { Teams } from "./components/Teams";

export const metadata: Metadata = {
  title: "Команди",
  description: "Керуйте своїми командами",
};

export default async function TeamsPage() {
  const teamsResponse = await authenticatedFetch(`${SERVER_URL}/v1/teams`, {
    cache: "no-store",
  });
  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команди");
  }

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const userData: CurrentUserResponse = await userResponse.json();
  const teamData: TeamsResponse = await teamsResponse.json();

  return <Teams teams={teamData.teams} user={userData.user} />;
}
