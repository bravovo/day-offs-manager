import Link from "next/link";

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
        </ul>
      </nav>

      {/* TODO додати функціонал виходу з акаунта  */}
      <div className="hidden border-t border-teal-800 px-2 py-5 md:block">
        <button
          className="cursor-pointer text-md font-bold bg-red-900 rounded-xl px-2 py-2 w-30
           hover:bg-red-800 transition-colors duration-200"
        >
          Вийти
        </button>
      </div>
    </aside>
  );
}
