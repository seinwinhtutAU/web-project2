import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { Category } from "@/app/lib/data";

type CategoryDB = Omit<Category, "_id"> & { _id: ObjectId };

function getIdFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop()!;
}

export async function GET(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const categoriesCollection: Collection<CategoryDB> =
      db.collection("categories");

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!category) return new Response("Category not found", { status: 404 });

    return NextResponse.json({ ...category, _id: category._id.toString() });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return new Response("Failed to fetch category", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const categoriesCollection: Collection<CategoryDB> =
      db.collection("categories");

    const updatedData = await req.json();
    const result = await categoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0)
      return new Response("Category not found", { status: 404 });

    const updatedCategory = await categoriesCollection.findOne({
      _id: new ObjectId(id),
    });
    return NextResponse.json({
      ...updatedCategory,
      _id: updatedCategory!._id.toString(),
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return new Response("Failed to update category", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);
    const client = await clientPromise;
    const db = client.db("toDoLists");
    const categoriesCollection: Collection<CategoryDB> =
      db.collection("categories");

    const result = await categoriesCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount === 0)
      return new Response("Category not found", { status: 404 });

    return new Response("Category deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return new Response("Failed to delete category", { status: 500 });
  }
}
