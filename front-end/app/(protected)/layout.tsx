import type { ReactNode } from "react";

import { SERVER_URL } from "@/configs/env";
import { authenticatedFetch, requireAuthentication } from "@/lib/auth";
import type { CurrentUserResponse } from "@/types/types";
import Sidebar from "./components/Sidebar";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAuthentication();

  const userResponse = await authenticatedFetch(`${SERVER_URL}/v1/auth/me`, {
    cache: "no-store",
  });

  if (!userResponse.ok) {
    throw new Error("Не вдалося завантажити дані користувача");
  }

  const userData: CurrentUserResponse = await userResponse.json();

  return (
    <div className="flex min-h-screen w-full flex-col pb-20 md:flex-row md:pb-0 font-sans px-3">
      <Sidebar hasTeam={Boolean(userData.teamId)} />
      <main className="flex min-w-0 flex-1 flex-col px-2 md:ml-64 md:p-0">
        {children}
      </main>
    </div>
  );
}
