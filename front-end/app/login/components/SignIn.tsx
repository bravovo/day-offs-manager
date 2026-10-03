"use client";

//TODO додати сторінку авторизації та її функціонал

export default function SignIn() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center px-1">
        <form className="w-full md:w-md flex flex-col gap-2 border border-zinc-500 rounded-2xl">
          <div className="w-full px-7 pt-2">
            <h3 className="font-bold text-2xl">Авторизація</h3>
          </div>
          <hr className="w-full border-zinc-500" />
          <div className="px-7 py-4 flex flex-col gap-2">
            <label htmlFor="email" className="flex flex-col gap-1">
              Електронна пошта
              <input
                type="text"
                name="email"
                className="border border-zinc-400 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="password" className="flex flex-col gap-1">
              Пароль
              <input
                type="password"
                name="password"
                className="border border-zinc-400 rounded-md outline-none p-2"
              />
            </label>
            <label htmlFor="passwordConfirm" className="flex flex-col gap-1">
              Підтвердження паролю
              <input
                type="password"
                name="passwordConfirm"
                className="border border-zinc-400 rounded-md outline-none p-2"
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-10 border-none bg-zinc-950 hover:bg-zinc-600 text-white rounded-xl px-3 py-1 transition-all cursor-pointer"
            >
              Створити акаунт
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
