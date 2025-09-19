// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Category from "@/models/Category";

// /**
//  * GET: Fetch all categories
//  */
// export async function GET() {
//   try {
//     await dbConnect();

//     const categoriesFromDb = await Category.find({}).sort({ name: 1 });
//     const categories = categoriesFromDb.map((cat) => ({
//       _id: cat._id.toString(),
//       name: cat.name,
//       color: cat.color,
//       order: cat.order ?? null,
//     }));

//     return NextResponse.json(categories);
//   } catch (error) {
//     console.error("Failed to fetch categories:", error);
//     return new Response("Failed to fetch categories", { status: 500 });
//   }
// }

// /**
//  * POST: Add a new category
//  */
// export async function POST(request) {
//   try {
//     await dbConnect();

//     const newCategoryData = await request.json();

//     // Create a new Mongoose document
//     const newCategory = new Category(newCategoryData);
//     const savedCategory = await newCategory.save();

//     return NextResponse.json(
//       {
//         _id: savedCategory._id.toString(),
//         name: savedCategory.name,
//         color: savedCategory.color,
//         order: savedCategory.order ?? null,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Failed to add new category:", error);
//     return new Response("Failed to add category", { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

/**
 * GET: Fetch all categories (no request needed)
 */
export async function GET() {
  try {
    await dbConnect();

    // Fetch all categories, sorted by name
    const categoriesFromDb = await Category.find({}).sort({ name: 1 });

    const categories = categoriesFromDb.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      color: cat.color,
      userId: cat.userId.toString(),
      order: cat.order ?? null,
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return new Response("Failed to fetch categories", { status: 500 });
  }
}

/**
 * POST: Add a new category for a user
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { name, color, userId, order } = await request.json();

    if (!userId || !name || !color) {
      return new Response("userId, name, and color are required", {
        status: 400,
      });
    }

    const newCategory = new Category({
      name,
      color,
      userId,
      order: order ?? null,
    });

    const savedCategory = await newCategory.save();

    return NextResponse.json(
      {
        _id: savedCategory._id.toString(),
        name: savedCategory.name,
        color: savedCategory.color,
        userId: savedCategory.userId.toString(),
        order: savedCategory.order ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add new category:", error);
    return new Response("Failed to add category", { status: 500 });
  }
}
