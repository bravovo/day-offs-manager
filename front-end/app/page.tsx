import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-san">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <h1>Головна</h1>
        <Link href="/sign-up" prefetch={false}>
          Створити акаунт
        </Link>
        <Link href="/sign-in" prefetch={false}>
          Авторизуватись
        </Link>
      </main>
    </div>
  );
}
