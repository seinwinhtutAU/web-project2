import TaskProvider from "./task-provider";
import UserProvider from "./user-provider";
import MainWrapper from "./ui/main-wrapper";
import { fetchTasksFromDb, fetchCategoriesFromDb } from "./lib/fetchDb";

export default async function TaskProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const tasks = await fetchTasksFromDb();
  const categories = await fetchCategoriesFromDb();

  return (
    <UserProvider>
      <TaskProvider initialTasks={tasks} initialCategories={categories}>
        <MainWrapper>{children}</MainWrapper>
      </TaskProvider>
    </UserProvider>
  );
}
