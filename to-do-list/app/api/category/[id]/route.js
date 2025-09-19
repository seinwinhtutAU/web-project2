import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

/**
 * Extracts the category ID from the request URL
 */
function getIdFromRequest(req) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

/**
 * GET: Fetch a single category by ID
 */
export async function GET(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const category = await Category.findById(id);
    if (!category) return new Response("Category not found", { status: 404 });

    return NextResponse.json({
      _id: category._id.toString(),
      name: category.name,
      color: category.color,
      order: category.order ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return new Response("Failed to fetch category", { status: 500 });
  }
}

/**
 * PUT: Update a category by ID
 */
export async function PUT(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);
    const updatedData = await req.json();

    const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
      new: true, // return the updated document
      runValidators: true, // ensure schema validation
    });

    if (!updatedCategory)
      return new Response("Category not found", { status: 404 });

    return NextResponse.json({
      _id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      color: updatedCategory.color,
      order: updatedCategory.order ?? null,
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return new Response("Failed to update category", { status: 500 });
  }
}

/**
 * DELETE: Remove a category by ID
 */
export async function DELETE(req) {
  try {
    await dbConnect();
    const id = getIdFromRequest(req);

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory)
      return new Response("Category not found", { status: 404 });

    return new Response("Category deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return new Response("Failed to delete category", { status: 500 });
  }
}
