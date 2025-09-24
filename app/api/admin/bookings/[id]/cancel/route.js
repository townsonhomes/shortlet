import connectDB from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Shortlet from "@/models/Shortlet";
import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/email/sendEmail";
import { bookingCancellationEmail } from "@/lib/email/templates/bookingCancellationEmail";
import { generateBookingReceipt } from "@/lib/pdf/generateBookingReceipt";

export async function PUT(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const booking = await Booking.findById(id)
      .populate("user")
      .populate("shortlet");

    if (!booking) {
      return Response.json({ error: "Booking not found." }, { status: 404 });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Free the booked dates
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    await Shortlet.updateOne(
      { _id: booking.shortlet._id },
      {
        $pull: {
          bookedDates: { checkInDate: checkIn, checkOutDate: checkOut },
        },
      }
    );

    // Generate PDF receipt
    let receiptBuffer;
    try {
      receiptBuffer = await generateBookingReceipt({
        booking,
        services: booking.services || [],
        totals: {
          bookingRevenue: booking.totalAmount || 0,
          servicesRevenue:
            booking.services?.reduce((acc, s) => acc + (s.price || 0), 0) || 0,
          totalRevenue:
            (booking.totalAmount || 0) +
            (booking.services?.reduce((acc, s) => acc + (s.price || 0), 0) ||
              0),
        },
      });
      console.log("✅ PDF generated, size:", receiptBuffer.length, "bytes");
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      receiptBuffer = null;
    }

    // Prepare email data
    const emailData = {
      to: booking.user.email,
      ...bookingCancellationEmail({
        name: booking.user.name,
        shortletTitle: booking.shortlet.title,
        checkInDate: checkIn.toLocaleDateString(),
        checkOutDate: checkOut.toLocaleDateString(),
      }),
    };

    // Add attachment only if PDF was generated successfully
    if (receiptBuffer) {
      emailData.attachments = [
        {
          filename: `receipt-${booking._id}.pdf`,
          content: Buffer.from(receiptBuffer), // Remove encoding when using Buffer
          contentType: "application/pdf",
          // Remove the encoding line entirely
        },
      ];
      console.log("📎 Attachment added to email data");
    }

    // Send email
    await sendEmail(emailData);

    // Create notification
    if (booking.user?._id) {
      await Notification.create({
        user: booking.user._id,
        message: `You have been checked out of ${booking.shortlet.title}`,
        read: false,
      });
    }

    return Response.json({
      message: "Booking cancelled.",
      receiptSent: !!receiptBuffer,
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
