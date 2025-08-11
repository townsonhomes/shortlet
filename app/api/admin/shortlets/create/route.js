import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const newShortlet = new Shortlet({
      title: body.title,
      description: body.description,
      location: body.location,
      category: body.category,
      images: body.images,
      pricePerDay: body.pricePerDay,
      amenities: body.amenities,
      ownership: body.ownership,
    });

    const saved = await newShortlet.save();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error creating shortlet:", error);
    return NextResponse.json(
      { message: "Error creating shortlet", error: error.message },
      { status: 500 }
    );
  }
}
