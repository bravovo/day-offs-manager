import type { Metadata } from "next";
import SignUp from "@/app/sign-up/components/SignUp";

export const metadata: Metadata = {
  title: "Створення акаунта",
  description: "Система контролю відпусток працівників",
};

export default function SignUpPageContainer() {
  return <SignUp />;
}
