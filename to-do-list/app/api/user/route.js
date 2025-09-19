import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

/**
 * GET: Fetch all users
 */
export async function GET() {
  try {
    await dbConnect();

    const usersFromDb = await User.find({}).sort({ createdAt: -1 }); // optional sort
    const users = usersFromDb.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return new Response("Failed to fetch users", { status: 500 });
  }
}

/**
 * POST: Add a new user
 */
export async function POST(request) {
  try {
    await dbConnect();
    const newUserData = await request.json();

    // Optional: you can hash the password here if needed
    const newUser = new User({
      ...newUserData,
      createdAt: new Date(),
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      {
        _id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add new user:", error);
    return new Response("Failed to add user", { status: 500 });
  }
}
