const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export default async function queueBackgroundWork(raw) {
  try {
    const event = JSON.parse(raw);

    // Only care about successful charges
    if (event.event !== "charge.success") return;

    const { reference, metadata } = event.data;

    /* 2️⃣  Build payload for /mark-paid */
    const payload = {
      serviceId: metadata.serviceId,
      reference,
    };

    /* 3️⃣  POST to internal /mark-paid route */
    const res = await fetch(`${BASE_URL}/api/admin/service/mark-paid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("adding service failed:", text);
    }
  } catch (err) {
    console.error("Webhook background error:", err);
  }
}
