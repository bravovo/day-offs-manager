import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import {
  CurrentUserResponse,
  RemainsResponse,
  RequestsResponse,
  TeamsResponse,
} from "@/types/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Requests from "./components/Requests";
import TeamSelector from "@/app/(protected)/components/TeamSelector";

export const metadata: Metadata = {
  title: "Робоче середовище",
  description: "Керуйте запитами на відпутки та лікарняні",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const { teamId: requestedTeamId } = await searchParams;
  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const userData: CurrentUserResponse = await userResponse.json();

  const teamsResponse = await authenticatedFetch(`${SERVER_URL}/v1/teams`, {
    cache: "no-store",
  });
  if (!teamsResponse.ok) {
    throw new Error("Не вдалося завантажити команди");
  }
  const teamsData: TeamsResponse = await teamsResponse.json();

  if (teamsData.teams.length === 0) {
    redirect("/teams");
  }

  const selectedTeam =
    teamsData.teams.find((team) => team._id === requestedTeamId) ??
    teamsData.teams.find((team) => team._id === userData.teamId) ??
    teamsData.teams[0];
  const selectedTeamId = selectedTeam._id;

  const selectedUserResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/auth/me?teamId=${encodeURIComponent(selectedTeamId)}`,
    { cache: "no-store" }
  );
  if (!selectedUserResponse.ok) {
    throw new Error("Не вдалося завантажити дані ролі команди");
  }
  const selectedUserData: CurrentUserResponse =
    await selectedUserResponse.json();

  const userRequestsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/requests?teamId=${encodeURIComponent(selectedTeamId)}&authorId=${encodeURIComponent(userData.user._id)}`,
    { cache: "no-store" }
  );

  if (!userRequestsResponse.ok) {
    throw new Error("Не вдалося завантажити список запитів");
  }

  if (userRequestsResponse.status === 204) return;
  const requestsData: RequestsResponse = await userRequestsResponse.json();

  const remainsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/requests/remains?teamId=${encodeURIComponent(selectedTeamId)}`,
    { cache: "no-store" }
  );

  if (!remainsResponse.ok) {
    throw new Error("Не вдалося завантажити залишки відпусток");
  }

  const remainsData: RemainsResponse = await remainsResponse.json();

  let adminRequestsData: RequestsResponse | null = null;

  const canReviewRequests = ["super", "admin"].includes(
    selectedUserData.userRole
  );

  if (canReviewRequests) {
    const adminRequestsResponse = await authenticatedFetch(
      `${SERVER_URL}/v1/requests?teamId=${encodeURIComponent(selectedTeamId)}&status=pending`,
      { cache: "no-store" }
    );
    if (!adminRequestsResponse.ok) {
      throw new Error("Не вдалося завантажити список запитів");
    }
    adminRequestsData = await adminRequestsResponse.json();
  }

  return (
    <>
      <div className="flex flex-col items-center bg-zinc-50">
        <TeamSelector teams={teamsData.teams} selectedTeamId={selectedTeamId} />
      </div>

      <Requests
        userRequests={requestsData.requests}
        userResponse={selectedUserData}
        canReviewRequests={canReviewRequests}
        adminRequests={canReviewRequests ? adminRequestsData!.requests : null}
        remains={remainsData.remains}
        teamId={selectedTeamId}
      />
    </>
  );
}
