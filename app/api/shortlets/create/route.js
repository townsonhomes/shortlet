// app/api/shortlets/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Only logged-in admins can post
  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    await dbConnect();
    const data = await req.json();

    const {
      title,
      description,
      location,
      category,
      images,
      pricePerDay,
      amenities = [],
      bookedDates = [],
    } = data;

    if (
      !title ||
      !description ||
      !category ||
      !images?.length ||
      !pricePerDay
    ) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const shortlet = await Shortlet.create({
      title,
      description,
      location,
      category,
      images,
      pricePerDay,
      amenities,
      bookedDates,
    });

    return new Response(JSON.stringify(shortlet), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
