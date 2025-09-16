import clientPromise from "./mongodb";
import { Task, Category } from "./data";
import { TaskDB, CategoryDB } from "./mongodb-types";

// Fetch tasks from MongoDB (runtime)
export async function fetchTasksFromDb(): Promise<Task[]> {
  const client = await clientPromise;
  const db = client.db("toDoLists");
  const tasksFromDb = await db.collection<TaskDB>("tasks").find().toArray();

  return tasksFromDb.map((task) => ({
    _id: task._id.toString(),
    title: task.title,
    startDate: task.startDate,
    dueDate: task.dueDate,
    note: task.note,
    category: task.category,
    status: task.status,
    userId: task.userId,
  }));
}

// Fetch categories from MongoDB (runtime)
export async function fetchCategoriesFromDb(): Promise<Category[]> {
  const client = await clientPromise;
  const db = client.db("toDoLists");
  const categoriesFromDb = await db
    .collection<CategoryDB>("categories")
    .find()
    .toArray();

  return categoriesFromDb.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name,
    color: cat.color,
    userId: cat.userId,
  }));
}
