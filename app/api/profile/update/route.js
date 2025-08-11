import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, gender, nationality, state, address, idImage, idType } =
    await req.json();
  await dbConnect();

  let isIdVerified = false;

  if (idType && idImage) {
    isIdVerified = true;
  }

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      phone,
      gender,
      nationality,
      state,
      address,
      idImage,
      idType,
      isIdVerified,
    },
    { new: true }
  );

  return Response.json({ success: true, updated });
}
