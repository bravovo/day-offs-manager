import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import {
  CurrentUserResponse,
  ExpandedTeamResponse,
  RemainsResponse,
  RequestsResponse,
} from "@/types/types";
import { Metadata } from "next";
import Team from "./components/Team";
import Requests from "../../dashboard/components/Requests";
import { notFound } from "next/navigation";

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
      cache: "no-store",
    }
  );

  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!teamsResponse.ok) {
    if (teamsResponse.status === 404) {
      notFound();
    }
    throw new Error("Не вдалося завантажити команду");
  }

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const data: ExpandedTeamResponse = await teamsResponse.json();
  const userData: CurrentUserResponse = await userResponse.json();

  const teamRole =
    data.team.members.find(
      (member) => member.memberId._id === userData.user._id
    )?.role ?? "worker";

  const selectedTeamUser: CurrentUserResponse = {
    ...userData,
    teamId: id,
    userRole:
      teamRole === "super" ||
      teamRole === "admin" ||
      teamRole === "manager"
        ? teamRole
        : "worker",
  };

  const ownRequestsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/requests?teamId=${encodeURIComponent(id)}&authorId=${encodeURIComponent(userData.user._id)}`,
    { cache: "no-store" }
  );
  if (!ownRequestsResponse.ok) {
    throw new Error("Не вдалося завантажити запити команди");
  }
  const ownRequestsData: RequestsResponse = await ownRequestsResponse.json();

  const canReviewRequests = ["super", "admin"].includes(teamRole);
  let adminRequests: RequestsResponse | null = null;

  if (canReviewRequests) {
    const adminRequestsResponse = await authenticatedFetch(
      `${SERVER_URL}/v1/requests?teamId=${encodeURIComponent(id)}&status=pending`,
      { cache: "no-store" }
    );
    if (!adminRequestsResponse.ok) {
      throw new Error("Не вдалося завантажити запити для перевірки");
    }
    adminRequests = await adminRequestsResponse.json();
  }

  const remainsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/requests/remains?teamId=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  if (!remainsResponse.ok) {
    throw new Error("Не вдалося завантажити залишки команди");
  }
  const remainsData: RemainsResponse = await remainsResponse.json();

  return (
    <>
      <Team team={data.team} user={userData.user} />
      <Requests
        userRequests={ownRequestsData.requests}
        adminRequests={canReviewRequests ? adminRequests!.requests : null}
        canReviewRequests={canReviewRequests}
        userResponse={selectedTeamUser}
        remains={remainsData.remains}
        teamId={id}
      />
    </>
  );
}
