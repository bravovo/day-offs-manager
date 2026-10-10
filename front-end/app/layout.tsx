import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Менеджер відпусток",
  description: "Система контролю відпусток працівників",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-teal-950">{children}</body>
    </html>
  );
}
