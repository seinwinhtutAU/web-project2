import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("Failed to check email:", error);
    return new Response("Failed to check email", { status: 500 });
  }
}
