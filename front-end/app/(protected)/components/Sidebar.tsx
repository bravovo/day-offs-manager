import Link from "next/link";

import { logout } from "@/lib/logout";
import LogoutButton from "./LogoutButton";

const navigationItems = [{ href: "/dashboard", label: "Робоче середовище" }];

export default function Sidebar() {
  return (
    <aside
      className="fixed bottom-0 left-0 z-10 flex w-full shrink-0 flex-col bg-teal-950
       text-white md:static md:min-h-screen md:w-64"
    >
      <nav className="flex-1 py-4">
        <ul className="flex justify-around gap-1 md:flex-col">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-2 py-2.5 rounded-md md:rounded-none text-center text-xs font-bold 
                  bg-teal-800 hover:bg-teal-700 text-white transition-colors duration-200 
                    md:px-3 md:text-left md:text-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="block md:hidden">
            <form action={logout}>
              <LogoutButton />
            </form>
          </li>
        </ul>
      </nav>

      <div className="hidden border-t border-teal-800 px-2 py-5 md:block">
        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </aside>
  );
}
