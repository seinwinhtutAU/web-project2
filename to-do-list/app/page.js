import ProtectedRoute from "./context/protectedRoute";
import Today from "./component/task/today";

export default function Page() {
  return (
    <ProtectedRoute>
      <Today />
    </ProtectedRoute>
  );
}
