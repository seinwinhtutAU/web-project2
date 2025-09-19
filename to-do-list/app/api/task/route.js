import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

/**
 * GET: Fetch all tasks
 */
export async function GET() {
  try {
    await dbConnect();

    const tasksFromDb = await Task.find({}).sort({ startDate: 1 }); // optional sort
    const tasks = tasksFromDb.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      startDate: task.startDate,
      dueDate: task.dueDate,
      note: task.note,
      category: task.category,
      status: task.status,
      userId: task.userId,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return new Response("Failed to fetch tasks", { status: 500 });
  }
}

/**
 * POST: Add a new task
 */
export async function POST(request) {
  try {
    await dbConnect();
    const newTaskData = await request.json();

    const newTask = new Task(newTaskData);
    const savedTask = await newTask.save();

    return NextResponse.json(
      {
        _id: savedTask._id.toString(),
        title: savedTask.title,
        startDate: savedTask.startDate,
        dueDate: savedTask.dueDate,
        note: savedTask.note,
        category: savedTask.category,
        status: savedTask.status,
        userId: savedTask.userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add new task:", error);
    return new Response("Failed to add task", { status: 500 });
  }
}
