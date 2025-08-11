import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user-ids" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Image upload failed", details: error.message },
      { status: 500 }
    );
  }
}
