"use client";

import { useActionState, useState } from "react";
import { signUp } from "@/app/sign-up/actions";
import { Loader } from "@/app/components/Loader/Loader";

export default function SignUp() {
  const [state, formAction, isPending] = useActionState(signUp, {
    error: undefined,
    success: undefined,
  });

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const handleFormDataChange = (type: string, value: string) => {
    if (type in formData) {
      setFormData((prev) => {
        return { ...prev, [type]: value };
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      {isPending && <Loader />}
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center px-1">
        <form
          action={formAction}
          className="w-full md:w-md flex flex-col gap-2 border-none rounded-2xl bg-white"
        >
          <div className="w-full px-7 pt-2">
            <h3 className="font-bold text-2xl text-teal-950">
              Створити акаунт
            </h3>
          </div>
          <hr className="w-full border-teal-950" />
          <div className="px-7 py-4 flex flex-col gap-2">
            <label htmlFor="email" className="flex flex-col gap-1">
              Електронна пошта
              <input
                required
                type="text"
                name="email"
                value={formData["email"]}
                onChange={(e) => {
                  e.preventDefault();
                  handleFormDataChange("email", e.target.value);
                }}
                className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="firstName" className="flex flex-col gap-1">
              Ім&apos;я
              <input
                required
                type="text"
                name="firstName"
                value={formData["firstName"]}
                onChange={(e) => {
                  e.preventDefault();
                  handleFormDataChange("firstName", e.target.value);
                }}
                className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="lastName" className="flex flex-col gap-1">
              Прізвище
              <input
                required
                type="text"
                name="lastName"
                value={formData["lastName"]}
                onChange={(e) => {
                  e.preventDefault();
                  handleFormDataChange("lastName", e.target.value);
                }}
                className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="password" className="flex flex-col gap-1">
              Пароль
              <input
                required
                type="password"
                name="password"
                value={formData["password"]}
                onChange={(e) => {
                  e.preventDefault();
                  handleFormDataChange("password", e.target.value);
                }}
                className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="passwordConfirm" className="flex flex-col gap-1">
              Підтвердження паролю
              <input
                required
                type="password"
                name="passwordConfirm"
                value={formData["confirmPassword"]}
                onChange={(e) => {
                  e.preventDefault();
                  handleFormDataChange("confirmPassword", e.target.value);
                }}
                className="border border-zinc-400 focus:border-teal-950 rounded-md outline-none p-2"
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-10 border-none bg-teal-950 hover:bg-teal-800 text-white rounded-xl 
                px-3 py-1 transition-all cursor-pointer duration-500"
            >
              Створити акаунт
            </button>
            {state.error && (
              <p className="font-bold text-red-600">{state.error}</p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
