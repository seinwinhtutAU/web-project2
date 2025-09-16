import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("toDoLists");
  const user = await db.collection("users").findOne({ email });

  return NextResponse.json({ exists: !!user });
}
