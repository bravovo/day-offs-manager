import type { ReactNode } from "react";

import { requireAuthentication } from "@/lib/auth";
import Sidebar from "./components/Sidebar";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAuthentication();

  return (
    <div className="flex min-h-screen w-full flex-col pb-20 md:flex-row md:pb-0 font-sans">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col px-2 md:p-0">
        {children}
      </main>
    </div>
  );
}
