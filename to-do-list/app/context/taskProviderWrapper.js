import MainWrapper from "./mainWrapper";
import { fetchTasksFromDb, fetchCategoriesFromDb } from "@/lib/serverfun";
import TaskProvider from "./taskProvider";
import UserProvider from "./userProvider";

export default async function TaskProviderWrapper({ children }) {
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
