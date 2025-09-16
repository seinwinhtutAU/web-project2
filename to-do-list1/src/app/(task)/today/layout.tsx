import ProtectedRoute from "@/app/ui/protected-route";

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
