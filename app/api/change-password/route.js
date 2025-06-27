import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { sendEmail } from "@/lib/email/sendEmail";
import { generatePasswordChangeEmail } from "@/lib/email/templates/passwordChange";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // const { currentPassword, newPassword } = await req.json();
  const { newPassword } = await req.json();
  if (!newPassword) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) {
    return Response.json(
      { error: "User not found or password not set" },
      { status: 404 }
    );
  }

  // const isMatch = await bcrypt.compare(currentPassword, user.password);
  // if (!isMatch) {
  //   return Response.json(
  //     { error: "Current password is incorrect" },
  //     { status: 401 }
  //   );
  // }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  user.password = hashed;
  await user.save();

  // Send confirmation email
  await sendEmail({
    to: user.email,
    ...generatePasswordChangeEmail(user.name),
  });

  return Response.json({ success: true, message: "Password updated" });
}
