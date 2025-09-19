import ProtectedRoute from "../context/protectedRoute";

export default function CalendarLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
