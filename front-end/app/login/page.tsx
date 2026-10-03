import type { Metadata } from "next";
import SignIn from "@/app/login/components/SignIn";

export const metadata: Metadata = {
  title: "Авторизація",
  description: "Система контролю відпусток працівників",
};

export default function LoginPageContainer() {
  return <SignIn />;
}
