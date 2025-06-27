// app/api/shortlets/seed/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function GET() {
  await dbConnect();

  const demoShortlets = [
    {
      title: "Modern Studio Apartment",
      description: "A cozy studio in the heart of the city.",
      category: "Rooms",
      images: ["/images/house1.png", "/images/house1.png"],
      pricePerDay: 10000,
      amenities: ["WiFi", "Air Conditioning", "Smart TV"],
      bookedDates: [],
    },
    {
      title: "Luxury Duplex with Pool",
      description: "Spacious duplex with private pool and parking.",
      category: "Duplex",
      images: ["/images/house1.png", "/images/house1.png"],
      pricePerDay: 30000,
      amenities: ["WiFi", "Pool", "Private Parking", "24/7 Security"],
      bookedDates: [],
    },
    {
      title: "Budget Friendly Room",
      description: "Affordable room with shared amenities.",
      category: "Rooms",
      images: ["/images/house1.png"],
      pricePerDay: 7000,
      amenities: ["Fan", "TV", "Shared Kitchen"],
      bookedDates: [],
    },
    {
      title: "Elegant 3-Bedroom Duplex",
      description: "Perfect for family or group stay.",
      category: "Duplex",
      images: ["/images/house1.png", "/images/house1.png"],
      pricePerDay: 35000,
      amenities: ["WiFi", "AC", "Washing Machine", "Balcony"],
      bookedDates: [],
    },
  ];

  try {
    await Shortlet.deleteMany(); // Optional: Clears existing ones
    await Shortlet.insertMany(demoShortlets);

    return NextResponse.json({
      success: true,
      message: "Shortlets seeded successfully",
      count: demoShortlets.length,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { success: false, message: "Seeding failed" },
      { status: 500 }
    );
  }
}
