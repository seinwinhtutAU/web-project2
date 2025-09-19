import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

/**
 * Extract task ID from the request URL
 */
function getIdFromRequest(req) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

/**
 * GET: Fetch a single task by ID
 */
export async function GET(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const task = await Task.findById(id);
    if (!task) return new Response("Task not found", { status: 404 });

    return NextResponse.json({
      _id: task._id.toString(),
      title: task.title,
      startDate: task.startDate,
      dueDate: task.dueDate,
      note: task.note,
      category: task.category,
      status: task.status,
      userId: task.userId,
    });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return new Response("Failed to fetch task", { status: 500 });
  }
}

/**
 * PUT: Update a task by ID
 */
export async function PUT(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);
    const updatedData = await req.json();

    const updatedTask = await Task.findByIdAndUpdate(id, updatedData, {
      new: true, // return the updated document
      runValidators: true, // validate fields according to schema
    });

    if (!updatedTask) return new Response("Task not found", { status: 404 });

    return NextResponse.json({
      _id: updatedTask._id.toString(),
      title: updatedTask.title,
      startDate: updatedTask.startDate,
      dueDate: updatedTask.dueDate,
      note: updatedTask.note,
      category: updatedTask.category,
      status: updatedTask.status,
      userId: updatedTask.userId,
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    return new Response("Failed to update task", { status: 500 });
  }
}

/**
 * DELETE: Remove a task by ID
 */
export async function DELETE(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) return new Response("Task not found", { status: 404 });

    return new Response("Task deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return new Response("Failed to delete task", { status: 500 });
  }
}
