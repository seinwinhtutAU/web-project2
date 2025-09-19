import ProtectedRoute from "@/app/context/protectedRoute";

export default function OverdueLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
