import mongoose from "mongoose";

const BookingPendingSchema = new mongoose.Schema(
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
    guests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
    },
    channel: {
      type: String,
      default: "checkout",
    },
  },
  { timestamps: true }
);

export default mongoose.models.BookingPending ||
  mongoose.model("BookingPending", BookingPendingSchema);
