import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SERVER_URL } from "@/configs/env";

async function verifyAccessToken(accessToken: string) {
  return fetch(`${SERVER_URL}/v1/auth/verify`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("token")?.value;

  if (accessToken && (await verifyAccessToken(accessToken)).ok) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    return NextResponse.next();
  }

  const refreshResponse = await fetch(`${SERVER_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `token=${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return NextResponse.next();
  }

  const refreshData: { accessToken?: string } = await refreshResponse.json();

  if (!refreshData.accessToken) {
    return NextResponse.next();
  }

  const responseHeaders = new Headers(request.headers);
  const cookies = request.cookies
    .getAll()
    .filter(({ name }) => name !== "accessToken")
    .map(({ name, value }) => `${name}=${value}`);
  cookies.push(`accessToken=${refreshData.accessToken}`);
  responseHeaders.set("cookie", cookies.join("; "));

  const response = NextResponse.next({
    request: {
      headers: responseHeaders,
    },
  });

  response.cookies.set("accessToken", refreshData.accessToken, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: "/dashboard/:path*",
};
