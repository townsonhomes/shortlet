import mongoose, { Schema, Types } from "mongoose";

const BookingSchema = new Schema(
  {
    shortlet: {
      type: Types.ObjectId,
      ref: "Shortlet",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    guests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: String,
      enum: ["manual", "checkout", "webhook"],
      default: "checkout",
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
