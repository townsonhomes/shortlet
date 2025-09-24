import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateBookingReceipt(details) {
  try {
    if (!details || !details.booking) {
      throw new Error("Invalid booking details");
    }

    const { booking, services = [], totals = {} } = details;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    let cursorY = height - 50;

    // Helper function to remove emojis and unsupported characters
    const sanitizeText = (text) => {
      if (typeof text !== "string") return String(text || "");
      // Remove emojis and non-ASCII characters that can't be encoded in WinAnsi
      return text.replace(/[^\x00-\x7F]/g, "").trim() || "N/A";
    };

    const drawText = (
      text,
      x,
      y,
      size = 12,
      color = rgb(0, 0, 0),
      useBold = false
    ) => {
      if (y < 50) return;
      const sanitizedText = sanitizeText(text);
      page.drawText(sanitizedText, {
        x,
        y,
        size,
        font: useBold ? boldFont : font,
        color,
      });
    };

    // Company Name (your requested addition)
    const companyName = "Towson Homes and Apartments";
    const companyColor = rgb(245 / 255, 179 / 255, 100 / 255); // Converted from OKLCH(79.5% .184 86.047)

    drawText(companyName, 50, cursorY, 22, companyColor, true);
    cursorY -= 35;

    // Header
    drawText("Booking Receipt", 50, cursorY, 20, rgb(0, 0, 0), true);
    cursorY -= 30;

    // Booking info - sanitize all text inputs
    const bookingId = sanitizeText(booking._id?.toString());
    const userName = sanitizeText(booking.user?.name);
    const userEmail = sanitizeText(booking.user?.email);
    const shortletTitle = sanitizeText(booking.shortlet?.title);

    drawText(`Booking ID: ${bookingId}`, 50, cursorY);
    cursorY -= 20;
    drawText(`Guest: ${userName} (${userEmail})`, 50, cursorY);
    cursorY -= 20;
    drawText(`Room: ${shortletTitle}`, 50, cursorY);
    cursorY -= 20;

    const statusText =
      booking.status === "cancelled"
        ? "Checked out"
        : sanitizeText(booking.status);
    drawText(`Status: ${statusText}`, 50, cursorY);
    cursorY -= 20;

    drawText(`Payment: ${booking.paid ? "Paid" : "Unpaid"}`, 50, cursorY);
    cursorY -= 20;

    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);
    drawText(`Check-in: ${checkInDate.toLocaleDateString()}`, 50, cursorY);
    cursorY -= 20;
    drawText(`Check-out: ${checkOutDate.toLocaleDateString()}`, 50, cursorY);
    cursorY -= 30;

    // Services
    drawText("Services:", 50, cursorY, 14, rgb(0, 0, 0), true);
    cursorY -= 20;

    if (services.length > 0) {
      services.forEach((s) => {
        const serviceDescription = sanitizeText(s.description);
        const requestedBy = sanitizeText(
          s.requestedBy?.name || s.requestedBy?.email || "-"
        );
        const price = s.price?.toLocaleString() || "0";
        const paymentStatus = sanitizeText(s.paymentStatus);

        drawText(
          `${serviceDescription} - ${requestedBy} - NGN ${price} - ${paymentStatus}`,
          50,
          cursorY,
          10 // Smaller font to fit more text
        );
        cursorY -= 15;
      });
    } else {
      drawText("No services purchased.", 50, cursorY, 12, rgb(0.5, 0.5, 0.5));
      cursorY -= 15;
    }

    cursorY -= 20;

    // Totals
    drawText("Summary:", 50, cursorY, 14, rgb(0, 0, 0), true);
    cursorY -= 20;

    const bookingRevenue = (totals.bookingRevenue ?? booking.totalAmount) || 0;
    const servicesRevenue = totals.servicesRevenue ?? 0;
    const totalRevenue =
      totals.totalRevenue ?? bookingRevenue + servicesRevenue;

    drawText(
      `Booking Expenditure: NGN ${bookingRevenue.toLocaleString()}`,
      50,
      cursorY
    );
    cursorY -= 20;
    drawText(
      `Services Expenditure: NGN ${servicesRevenue.toLocaleString()}`,
      50,
      cursorY
    );
    cursorY -= 20;
    drawText(
      `Total Expenditure: NGN ${totalRevenue.toLocaleString()}`,
      50,
      cursorY,
      12,
      rgb(0, 0, 0),
      true
    );

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
