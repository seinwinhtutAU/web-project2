// pages/api/users.ts
import { NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest } from "next/server";

// Define the shape for inserting a new user
interface UserInsert {
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Handles GET requests to fetch all users from the database.
 */
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("toDoLists"); // Use your database name
    const usersCollection: Collection = db.collection("users"); // Use your collection name

    const usersFromDb = await usersCollection.find({}).toArray();

    // Convert _id from ObjectId to string
    const users = usersFromDb.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return new Response("Failed to fetch users", { status: 500 });
  }
}

/**
 * Handles POST requests to add a new user to the database.
 */
export async function POST(request: NextRequest) {
  try {
    const newUserData: UserInsert = await request.json();
    const client = await clientPromise;
    const db = client.db("toDoLists"); // Use your database name
    const usersCollection: Collection = db.collection("users"); // Use your collection name

    // Add a creation timestamp
    const userToInsert = {
      ...newUserData,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(userToInsert);
    const createdUser = {
      _id: result.insertedId.toString(),
      ...userToInsert,
    };

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("Failed to add new user:", error);
    return new Response("Failed to add user", { status: 500 });
  }
}
