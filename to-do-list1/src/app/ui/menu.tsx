import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Menu() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Today", href: "/today", icon: "today" },
    { name: "Upcoming", href: "/upcoming", icon: "event" },
    { name: "Completed", href: "/completed", icon: "done" },
    { name: "Overdue", href: "/overdue", icon: "priority_high" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg p-6 flex flex-col">
      {/* Logo / Title */}
      <div className="flex items-center mb-10">
        <span className="material-icons text-4xl text-green-500 mr-3">
          check_circle
        </span>
        <h1 className="text-2xl font-bold text-gray-800">CalenDo</h1>
      </div>

      {/* Tasks Menu */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Tasks</h2>
      <ul className="flex flex-col gap-2 mb-8">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                pathname === item.href
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="border-gray-300 mb-6" />

      {/* Calendar Link */}
      <Link
        href="/calendar"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
          pathname === "/calendar"
            ? "bg-green-100 text-green-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
        }`}
      >
        <span className="material-icons">calendar_today</span>
        Calendar
      </Link>

      {/* Optional extra space / widget */}
      <div className="mt-auto text-gray-400 text-sm px-4 pt-6">
        &copy; {new Date().getFullYear()} Task Manager
      </div>
    </div>
  );
}
