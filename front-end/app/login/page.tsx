import type { Metadata } from "next";
import Login from "@/app/login/components/Login";

export const metadata: Metadata = {
  title: "Авторизація",
  description: "Увійдіть у свій акаунт для керування відпустками",
};

export default function LoginPageContainer() {
  return <Login />;
}
