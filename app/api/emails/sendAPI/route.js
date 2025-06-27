import { sendEmail } from "@/lib/email/sendEmail";
import { generateBookingConfirmationEmail } from "@/lib/email/templates/bookingConfirmation";

export async function POST(req) {
  const { email, name, shortlet, checkInDate, checkOutDate, totalAmount } =
    await req.json();

  try {
    await sendEmail({
      to: email,
      ...generateBookingConfirmationEmail({
        name,
        shortlet,
        checkInDate,
        checkOutDate,
        totalAmount,
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
