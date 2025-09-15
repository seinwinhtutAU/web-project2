import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { User } from "@/app/lib/data";

// DB type: _id is ObjectId
type UserDB = Omit<User, "_id"> & { _id: ObjectId };

// Helper to get [id] from URL
function getIdFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop()!;
}

export async function GET(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const usersCollection: Collection<UserDB> = db.collection("users");

    const userFromDb = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!userFromDb) return new Response("User not found", { status: 404 });

    return NextResponse.json({ ...userFromDb, _id: userFromDb._id.toString() });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return new Response("Failed to fetch user", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const usersCollection: Collection<UserDB> = db.collection("users");

    const updateData: Partial<User> = await req.json();
    const { _id, ...dataWithoutId } = updateData;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: dataWithoutId }
    );

    if (result.matchedCount === 0)
      return new Response("User not found", { status: 404 });

    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(id),
    });
    return NextResponse.json({
      ...updatedUser,
      _id: updatedUser!._id.toString(),
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return new Response("Failed to update user", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const usersCollection: Collection<UserDB> = db.collection("users");

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return new Response("User not found", { status: 404 });

    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return new Response("Failed to delete user", { status: 500 });
  }
}
