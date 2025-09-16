"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/user-provider";

export default function Menu() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useUser();

  const menuItems = [
    { name: "Today", href: "/today", icon: "today" },
    { name: "Upcoming", href: "/upcoming", icon: "event" },
    { name: "Completed", href: "/completed", icon: "done" },
    { name: "Overdue", href: "/overdue", icon: "priority_high" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-green-50 shadow-lg p-6 flex flex-col">
      {/* Logo / Title */}
      <div className="flex items-center mb-10">
        <span className="material-icons text-4xl text-green-600 mr-3">
          check_circle
        </span>
        <h1 className="text-2xl font-bold text-green-800">CalenDo</h1>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="mb-6 px-4 py-2 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold truncate">
            {currentUser.name}
          </p>
          <p className="text-green-700 text-sm truncate">{currentUser.email}</p>
        </div>
      )}

      {/* Tasks Menu */}
      <h2 className="text-lg font-semibold text-green-700 mb-4">Tasks</h2>
      <ul className="flex flex-col gap-2 mb-8">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                pathname === item.href
                  ? "bg-green-600 text-white font-semibold"
                  : "text-green-800 hover:bg-green-100 hover:text-green-700"
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="border-green-300 mb-6" />

      {/* Calendar */}
      <Link
        href="/calendar"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
          pathname === "/calendar"
            ? "bg-green-600 text-white font-semibold"
            : "text-green-800 hover:bg-green-100 hover:text-green-700"
        }`}
      >
        <span className="material-icons">calendar_today</span>
        Calendar
      </Link>

      {/* Profile & Logout */}
      <div className="mt-auto flex flex-col gap-2">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
            pathname === "/profile"
              ? "bg-green-600 text-white font-semibold"
              : "text-green-800 hover:bg-green-100 hover:text-green-700"
          }`}
        >
          <span className="material-icons">person</span>
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-green-800 hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
        >
          <span className="material-icons">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
