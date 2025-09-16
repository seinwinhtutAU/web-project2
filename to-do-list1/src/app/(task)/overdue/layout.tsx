import ProtectedRoute from "@/app/ui/protected-route";

export default function OverdueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
