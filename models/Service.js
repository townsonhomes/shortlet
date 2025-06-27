// models/Service.js
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    shortlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shortlet",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentReference: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);
