"use server";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateUserDetails(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not authenticated");

  await dbConnect();

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      $set: {
        phone: formData.phone,
        gender: formData.gender,
        nationality: formData.nationality,
        state: formData.state,
        address: formData.address,
      },
    },
    { new: true }
  );

  return updated;
}
