import ProtectedRoute from "@/app/context/protectedRoute";

export default function CompleteLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
