import ProtectedRoute from "@/app/context/protectedRoute";

export default function UpcomingLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
