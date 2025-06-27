import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, gender, nationality, state, address } = await req.json();

  await dbConnect();

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { phone, gender, nationality, state, address },
    { new: true }
  );

  return Response.json({ success: true, updated });
}
