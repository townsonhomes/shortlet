import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function PATCH(req, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const body = await req.json();

    const updated = await Shortlet.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        location: body.location,
        category: body.category,
        images: body.images,
        pricePerDay: body.pricePerDay,
        amenities: body.amenities,
        ownership: body.ownership,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Shortlet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating shortlet:", error);
    return NextResponse.json(
      { message: "Error updating shortlet", error: error.message },
      { status: 500 }
    );
  }
}
