// import dbConnect from "./db";
// import Task from "@/models/Task";
// import Category from "@/models/Category";

// export async function fetchCategoriesFromDb() {
//   await dbConnect();

//   const categoriesFromDb = await Category.find({}).lean();

//   return categoriesFromDb.map((cat) => ({
//     _id: cat._id.toString(),
//     name: cat.name,
//     color: cat.color,
//     userId: cat.userId,
//   }));
// }

// export async function fetchTasksFromDb() {
//   await dbConnect();

//   const tasksFromDb = await Task.find({}).lean();

//   return tasksFromDb.map((task) => ({
//     _id: task._id.toString(),
//     title: task.title,
//     startDate: task.startDate,
//     dueDate: task.dueDate,
//     note: task.note,
//     category: task.category,
//     status: task.status,
//     userId: task.userId,
//   }));
// }

import dbConnect from "./db";
import Task from "@/models/Task";
import Category from "@/models/Category";

export async function fetchCategoriesFromDb() {
  await dbConnect();
  const categoriesFromDb = await Category.find({}).lean();

  return categoriesFromDb.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name,
    color: cat.color,
    // convert ObjectId to string if it's a reference
    userId: cat.userId?.toString?.() ?? null,
  }));
}

export async function fetchTasksFromDb() {
  await dbConnect();
  const tasksFromDb = await Task.find({}).lean();

  return tasksFromDb.map((task) => ({
    _id: task._id.toString(),
    title: task.title,
    // convert Dates to ISO strings
    startDate: task.startDate?.toISOString?.() ?? null,
    dueDate: task.dueDate?.toISOString?.() ?? null,
    note: task.note,
    // convert category reference or embedded doc
    category:
      typeof task.category === "object" && task.category?._id
        ? task.category._id.toString()
        : task.category?.toString?.() ?? null,
    status: task.status,
    userId: task.userId?.toString?.() ?? null,
  }));
}
