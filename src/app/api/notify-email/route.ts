import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = rateLimit(`notify-email:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { orderNumber, customerName, phone, address, paymentMethod, transactionId, total, items } = body;
    const adminEmail = process.env.ADMIN_EMAIL || "umairali.c3@gmail.com";

    const { sendOrderEmail } = await import("@/lib/notifications");
    const result = await sendOrderEmail({
      orderNumber,
      customerName,
      phone,
      address,
      paymentMethod,
      transactionId,
      total,
      items: items || [],
    });

    if (result.success) {
      return NextResponse.json({ success: true, method: result.method });
    }

    // Fallback: return mailto link for manual sending
    const subject = encodeURIComponent(`New Order #${orderNumber} — Rs ${total}`);
    const mailtoBody = encodeURIComponent(
      `Order #: ${orderNumber}\nCustomer: ${customerName}\nPhone: ${phone}\nAddress: ${address}\nPayment: ${paymentMethod}\nTotal: Rs ${total}\n\nItems:\n${(items || []).map((it: any) => `- ${it.product_name} x${it.quantity} = Rs ${it.price * it.quantity}`).join("\n")}`
    );
    const mailto = `mailto:${adminEmail}?subject=${subject}&body=${mailtoBody}`;
    return NextResponse.json({ success: true, method: "mailto", mailto });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}