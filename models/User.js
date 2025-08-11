import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    nationality: {
      type: String,
    },
    state: {
      type: String,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    idType: {
      type: String,
      required: false,
    },
    idImage: {
      type: String,
      required: false,
    },
    isIdVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
