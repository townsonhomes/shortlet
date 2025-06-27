import connectDB from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { sendEmail } from "@/lib/email/sendEmail"; // your reusable email utility
import { bookingCancellationEmail } from "@/lib/email/templates/bookingCancellationEmail";
import Notification from "@/models/Notification";
import Shortlet from "@/models/Shortlet";
export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;
  try {
    const booking = await Booking.findById(id)
      .populate("user")
      .populate("shortlet");
    if (!booking)
      return Response.json({ error: "Booking not found." }, { status: 404 });

    booking.status = "cancelled";
    await booking.save();

    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    await Shortlet.updateOne(
      { _id: booking.shortlet._id },
      {
        $pull: {
          bookedDates: {
            checkInDate: { $eq: checkIn },
            checkOutDate: { $eq: checkOut },
          },
        },
      }
    );

    // Send cancellation email
    await sendEmail({
      to: booking.user.email,
      ...bookingCancellationEmail({
        name: booking.user.name,
        shortletTitle: booking.shortlet.title,
        checkInDate: new Date(booking.checkInDate).toLocaleDateString(),
        checkOutDate: new Date(booking.checkOutDate).toLocaleDateString(),
      }),
    });
    if (booking.user?._id) {
      await Notification.create({
        user: booking.user._id,
        message: `You have been checked out of ${booking.shortlet.title}`,
        read: false,
      });
    }
    return Response.json({ message: "Booking cancelled." });
  } catch (err) {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
