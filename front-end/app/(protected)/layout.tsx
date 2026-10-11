import type { ReactNode } from "react";

import { requireAuthentication } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAuthentication();

  return children;
}
