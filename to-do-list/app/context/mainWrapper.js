"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }) {
  const pathname = usePathname();
  const hideMenuOn = ["/login", "/signup"];
  const hasMenu = !hideMenuOn.includes(pathname);

  return <main className={hasMenu ? "ml-64 p-8" : "p-8"}>{children}</main>;
}
