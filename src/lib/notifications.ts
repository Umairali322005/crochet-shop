export async function sendOrderEmail(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  transactionId?: string | null;
  total: number;
  items: { product_name: string; quantity: number; price: number }[];
}): Promise<{ success: boolean; method: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || "umairali.c3@gmail.com";
  const resendKey = process.env.RESEND_API_KEY;

  const itemsHtml = params.items.map((it) => `<li>${it.product_name} × ${it.quantity} — Rs ${it.price * it.quantity}</li>`).join("");
  const html = `
    <h2>🧶 New Order — Crochet Haven</h2>
    <p><strong>Order #:</strong> ${params.orderNumber}</p>
    <p><strong>Customer:</strong> ${params.customerName}</p>
    <p><strong>Phone:</strong> ${params.phone}</p>
    <p><strong>Address:</strong> ${params.address}</p>
    <p><strong>Payment:</strong> ${params.paymentMethod === "cod" ? "Cash on Delivery" : "Easypaisa"}${params.transactionId ? ` (Txn: ${params.transactionId})` : ""}</p>
    <p><strong>Total:</strong> Rs ${params.total}</p>
    <h3>Items:</h3>
    <ul>${itemsHtml}</ul>
    <hr/>
    <p style="color:#888;font-size:12px;">Automated notification from Crochet Haven.</p>
  `;

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "Crochet Haven <orders@crochethaven.com>",
          to: [adminEmail],
          subject: `🧶 New Order #${params.orderNumber} — Rs ${params.total}`,
          html,
        }),
      });
      if (res.ok) return { success: true, method: "resend" };
    } catch {
      // fall through
    }
  }

  // Fallback: no email sent automatically
  return { success: false, method: "none" };
}