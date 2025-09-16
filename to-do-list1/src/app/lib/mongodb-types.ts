import { ObjectId } from "mongodb";
import { Task, Category } from "./data";

// MongoDB versions of your types
export type TaskDB = Omit<Task, "_id"> & { _id: ObjectId };
export type CategoryDB = Omit<Category, "_id"> & { _id: ObjectId };
