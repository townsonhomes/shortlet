// models/Shortlet.js
import mongoose from "mongoose";

const ShortletSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    ownership: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: false, // optional
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [(array) => array.length > 0, "At least one image is required"],
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
      required: true,
    },
    bookedDates: {
      type: [{ checkInDate: Date, checkOutDate: Date }],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Shortlet ||
  mongoose.model("Shortlet", ShortletSchema);
