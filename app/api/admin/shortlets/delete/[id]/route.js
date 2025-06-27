import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function DELETE(req, context) {
  const { id } = await context.params;
  try {
    await connectDB();

    const deleted = await Shortlet.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Shortlet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Shortlet deleted successfully" });
  } catch (error) {
    console.error("Error deleting shortlet:", error);
    return NextResponse.json(
      { message: "Error deleting shortlet", error: error.message },
      { status: 500 }
    );
  }
}
