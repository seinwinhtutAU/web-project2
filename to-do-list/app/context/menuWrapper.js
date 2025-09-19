"use client";

import { usePathname } from "next/navigation";
import Menu from "../component/menu";

export default function MenuWrapper() {
  const pathname = usePathname();
  const hideMenuOn = ["/login", "/signup"];

  if (hideMenuOn.includes(pathname)) return null;

  return <Menu />;
}
