import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { CurrentUserResponse, ExpandedTeamResponse } from "@/types/types";
import { Metadata } from "next";
import Team from "./components/Team";

export const metadata: Metadata = {
  title: "Сторінка команди",
  description: "Керуйте своєю командою",
};

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teamsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/teams/${id}`,
    {
      cache: "force-cache",
    }
  );

  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команду");
  }

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const data: ExpandedTeamResponse = await teamsResponse.json();
  const userData: CurrentUserResponse = await userResponse.json();

  return <Team team={data.team} user={userData.user} />;
}
