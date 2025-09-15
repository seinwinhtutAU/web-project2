"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Task, Category } from "./lib/data";
import { fetchTasks, fetchCategories, addCategory } from "./lib/data";
import { useUser } from "./user-provider";

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  refreshTasks: () => Promise<void>;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

export default function TaskProvider({
  children,
  initialTasks = [],
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialTasks?: Task[];
  initialCategories?: Category[];
}) {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const refreshTasks = async () => {
    if (!currentUser) return;

    try {
      // Fetch all tasks and categories
      const fetchedTasks = await fetchTasks();
      const fetchedCategories = await fetchCategories();

      // Filter categories and tasks for current user
      let userCategories = fetchedCategories.filter(
        (cat) => cat.userId === currentUser._id
      );
      const userTasks = fetchedTasks.filter(
        (task) => task.userId === currentUser._id
      );

      // If user has no categories, create defaults
      if (!userCategories || userCategories.length === 0) {
        const defaultCats = [
          { name: "Work", color: "#2563eb", userId: currentUser._id },
          { name: "Personal", color: "#16a34a", userId: currentUser._id },
          { name: "Other", color: "#f59e0b", userId: currentUser._id },
        ];
        const createdCategories: Category[] = [];
        for (const cat of defaultCats) {
          const newCat = await addCategory(cat);
          createdCategories.push(newCat);
        }
        userCategories = createdCategories;
      }

      setTasks(userTasks);
      setCategories(userCategories);
    } catch (error) {
      console.error("Failed to refresh tasks and categories:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshTasks();
    }
  }, [currentUser]);

  return (
    <TaskContext.Provider
      value={{ tasks, setTasks, categories, setCategories, refreshTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
}
