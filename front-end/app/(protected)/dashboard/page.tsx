import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { TeamsResponse } from "@/types/types";
import { Metadata } from "next";
import { Dashboard } from "@/app/(protected)/dashboard/components/Dashboard";

export const metadata: Metadata = {
  title: "Робоче середовище",
  description: "Керуйте своїми командами та відпустками",
};

export default async function DashboardPage() {
  const teamsResponse = await authenticatedFetch(`${SERVER_URL}/v1/teams`, {
    cache: "no-store",
  });

  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команди");
  }

  const data: TeamsResponse = await teamsResponse.json();

  return <Dashboard teams={data.teams} />;
}
