import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

/**
 * Extract the user ID from the request URL
 */
function getIdFromRequest(req) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

/**
 * GET: Fetch a single user by ID
 */
export async function GET(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const user = await User.findById(id);
    if (!user) return new Response("User not found", { status: 404 });

    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return new Response("Failed to fetch user", { status: 500 });
  }
}

/**
 * PUT: Update a user by ID
 */
export async function PUT(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);
    const updateData = await req.json();

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true, // return updated document
      runValidators: true, // validate fields
    });

    if (!updatedUser) return new Response("User not found", { status: 404 });

    return NextResponse.json({
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return new Response("Failed to update user", { status: 500 });
  }
}

/**
 * DELETE: Remove a user by ID
 */
export async function DELETE(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return new Response("User not found", { status: 404 });

    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return new Response("Failed to delete user", { status: 500 });
  }
}
