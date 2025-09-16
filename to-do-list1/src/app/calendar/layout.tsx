import ProtectedRoute from "@/app/ui/protected-route";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
