import { NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest } from "next/server";
import { Task } from "@/app/lib/data";

type TaskInsert = Omit<Task, "_id"> & {
  startDate: Date;
  dueDate: Date;
};

/**
 * Handles GET requests to fetch all tasks from the database.
 */
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("toDoLists");

    // Get the tasks collection
    const tasksCollection: Collection = db.collection("tasks");

    // Fetch all documents from the tasks collection
    const tasksFromDb = await tasksCollection.find({}).toArray();

    // Convert _id from ObjectId to string
    const tasks = tasksFromDb.map((task) => ({
      ...task,
      _id: task._id.toString(),
    }));

    // Return the fetched data as a JSON response
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return new Response("Failed to fetch tasks", { status: 500 });
  }
}

/**
 * Handles POST requests to add a new task to the database.
 */
export async function POST(request: NextRequest) {
  try {
    const newTaskData: TaskInsert = await request.json();
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const tasksCollection: Collection = db.collection("tasks");

    const result = await tasksCollection.insertOne(newTaskData);
    const createdTask = {
      _id: result.insertedId.toString(),
      ...newTaskData,
    };

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error("Failed to add new task:", error);
    return new Response("Failed to add task", { status: 500 });
  }
}
