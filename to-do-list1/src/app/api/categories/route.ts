import { NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest } from "next/server";

/**
 * Handles GET requests to fetch all categories from the database.
 * @param request The incoming request object.
 */
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("toDoLists");

    // Get the categories collection
    const categoriesCollection: Collection = db.collection("categories");

    // Fetch all documents from the categories collection
    const categoriesFromDb = await categoriesCollection.find({}).toArray();

    // Convert _id from ObjectId to string
    const categories = categoriesFromDb.map((cat) => ({
      ...cat,
      _id: cat._id.toString(),
    }));

    // Return the fetched data as a JSON response
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return new Response("Failed to fetch categories", { status: 500 });
  }
}

/**
 * Handles POST requests to add a new category to the database.
 * @param request The incoming request object.
 */
export async function POST(request: NextRequest) {
  try {
    const newCategoryData = await request.json();
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const categoriesCollection: Collection = db.collection("categories");

    const result = await categoriesCollection.insertOne(newCategoryData);
    const createdCategory = {
      _id: result.insertedId.toString(),
      ...newCategoryData,
    };

    return NextResponse.json(createdCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to add new category:", error);
    return new Response("Failed to add category", { status: 500 });
  }
}
