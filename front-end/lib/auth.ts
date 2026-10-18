"use server";

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

async function getValidAccessToken() {
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

  return response?.ok && accessToken ? accessToken : null;
}

export async function requireAuthentication() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  return accessToken;
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const accessToken = await requireAuthentication();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("accessToken");

  redirect("/login");
}
