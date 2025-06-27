import { sendEmail } from "@/lib/email/sendEmail";
import partnerShipRequestEmail from "@/lib/email/templates/partnershipRequestEmail";
export async function POST(req) {
  const { firstName, lastName, email, phone, state, location, description } =
    await req.json();

  try {
    await sendEmail({
      to: process.env.EMAIL_USER, // Replace with actual admin email
      ...partnerShipRequestEmail({
        firstName,
        lastName,
        email,
        phone,
        state,
        location,
        description,
      }),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json(
      { success: false, error: "Email send failed" },
      { status: 500 }
    );
  }
}
