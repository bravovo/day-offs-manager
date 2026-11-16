import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch } from "@/lib/auth";
import { CurrentUserResponse, RequestsResponse } from "@/types/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Requests from "./components/Requests";

export const metadata: Metadata = {
  title: "Робоче середовище",
  description: "Керуйте запитами на відпутки та лікарняні",
};

export default async function DashboardPage() {
  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const userData: CurrentUserResponse = await userResponse.json();

  if (!userData.teamId) {
    redirect("/teams");
  }

  const userRequestsResponse = await authenticatedFetch(
    `${SERVER_URL}/v1/requests?authorId=${userData.user._id}`,
    { cache: "no-store" }
  );

  if (!userRequestsResponse.ok) {
    throw new Error("Не вдалося завантажити список запитів");
  }

  if (userRequestsResponse.status === 204) return;
  const requestsData: RequestsResponse = await userRequestsResponse.json();

  let adminRequestsData: RequestsResponse | null = null;

  const canReviewRequests = ["super", "admin"].includes(userData.userRole);

  if (canReviewRequests) {
    const adminRequestsResponse = await authenticatedFetch(
      `${SERVER_URL}/v1/requests?status=pending`,
      { cache: "no-store" }
    );
    if (!adminRequestsResponse.ok) {
      throw new Error("Не вдалося завантажити список запитів");
    }
    adminRequestsData = await adminRequestsResponse.json();
  }

  console.log(userData.userRole);

  return (
    <Requests
      userRequests={requestsData.requests}
      userResponse={userData}
      canReviewRequests={canReviewRequests}
      adminRequests={canReviewRequests ? adminRequestsData!.requests : null}
    />
  );
}
