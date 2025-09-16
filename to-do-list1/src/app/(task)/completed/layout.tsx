import ProtectedRoute from "@/app/ui/protected-route";

export default function CompletedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
