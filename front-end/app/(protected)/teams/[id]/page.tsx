import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { TeamResponse } from "@/types/types";
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

  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команду");
  }

  const data: TeamResponse = await teamsResponse.json();

  return <Team team={data.team} />;
}
