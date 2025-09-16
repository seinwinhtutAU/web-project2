"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/user-provider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isHydrated } = useUser(); // add isHydrated
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !currentUser) {
      router.replace("/login"); // only redirect after hydration
    }
  }, [currentUser, isHydrated, router]);

  if (!isHydrated || !currentUser) return null; // wait for hydration

  return <>{children}</>;
}
