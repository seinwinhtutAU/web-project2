import ProtectedRoute from "@/app/ui/protected-route";
import Today from "./ui/today";

export default function Page() {
  return (
    <ProtectedRoute>
      <Today />
    </ProtectedRoute>
  );
}
