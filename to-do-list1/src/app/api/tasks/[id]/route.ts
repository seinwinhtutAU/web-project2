import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { Task } from "@/app/lib/data";

type TaskDB = Omit<Task, "_id"> & { _id: ObjectId };

function getIdFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop()!;
}

export async function GET(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const tasksCollection: Collection<TaskDB> = db.collection("tasks");

    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
    if (!task) return new Response("Task not found", { status: 404 });

    return NextResponse.json({ ...task, _id: task._id.toString() });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return new Response("Failed to fetch task", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const tasksCollection: Collection<TaskDB> = db.collection("tasks");

    const updatedData = await req.json();
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0)
      return new Response("Task not found", { status: 404 });

    const updatedTask = await tasksCollection.findOne({
      _id: new ObjectId(id),
    });
    return NextResponse.json({
      ...updatedTask,
      _id: updatedTask!._id.toString(),
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    return new Response("Failed to update task", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const tasksCollection: Collection<TaskDB> = db.collection("tasks");

    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return new Response("Task not found", { status: 404 });

    return new Response("Task deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return new Response("Failed to delete task", { status: 500 });
  }
}
