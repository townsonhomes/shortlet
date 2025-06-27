export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const reference = req.nextUrl.pathname.split("/").pop(); // Or extract from path

  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (data.status && data.data) {
      const receiptUrl = data.data.receipt_number
        ? `https://dashboard.paystack.com/receipt/${data.data.id}`
        : null;

      if (receiptUrl) {
        return Response.redirect(receiptUrl);
      } else {
        return Response.json(
          { error: "Receipt URL not available for this transaction." },
          { status: 404 }
        );
      }
    } else {
      return Response.json(
        { error: "Transaction not found." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
