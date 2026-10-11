import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SERVER_URL } from "@/configs/env";

async function verifyAccessToken(accessToken: string) {
  return fetch(`${SERVER_URL}/v1/auth/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}

export async function requireAuthentication() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("token")?.value;

  let response = accessToken ? await verifyAccessToken(accessToken) : null;

  if ((!response || !response.ok) && refreshToken) {
    const refreshResponse = await fetch(`${SERVER_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `token=${refreshToken}`,
      },
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      const refreshData: { accessToken?: string } =
        await refreshResponse.json();
      accessToken = refreshData.accessToken;
      response = accessToken ? await verifyAccessToken(accessToken) : null;
    }
  }

  if (!response?.ok) {
    redirect("/login");
  }
}
