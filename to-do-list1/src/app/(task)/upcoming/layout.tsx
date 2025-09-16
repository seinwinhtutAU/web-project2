import ProtectedRoute from "@/app/ui/protected-route";

export default function UpcomingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
