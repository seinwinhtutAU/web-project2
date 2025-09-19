import ProtectedRoute from "@/app/context/protectedRoute";

export default function TodayLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
