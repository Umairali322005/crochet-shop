import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(3).max(20),
  notes: z.string().max(500).optional().nullable(),
  payment_method: z.enum(["cod", "easypaisa"]),
  transaction_id: z.string().max(100).optional().nullable(),
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
  total: z.number().positive(),
  items: z.array(z.object({
    product_id: z.string().min(1),
    product_name: z.string().min(1).max(200),
    product_image: z.string().optional().nullable(),
    price: z.number().positive(),
    quantity: z.number().int().positive().max(100),
    color: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
  })).min(1),
});

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  // Rate limit: 10 orders per 10 minutes per IP
  const ip = getClientIP(request);
  const rl = rateLimit(`orders:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order data", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const orderNumber = "CH" + Date.now().toString(36).toUpperCase() + randomBytes(2).toString("hex").toUpperCase();

    // If Supabase configured, persist
    if (hasSupabase()) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
        }

        const admin = await createAdminClient();

        const { data: order, error } = await admin.from("orders").insert({
        user_id: user?.id ?? null,
        order_number: orderNumber,
        status: "pending",
        payment_method: data.payment_method,
        payment_status: "pending",
        transaction_id: data.transaction_id || null,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        shipping_name: data.name,
        shipping_email: data.email,
        shipping_phone: data.phone,
        shipping_address: data.address,
        shipping_city: data.city,
        shipping_state: data.state,
        shipping_pincode: data.pincode,
        notes: data.notes,
      }).select().single();

      if (error) {
        console.error("Order insert error:", error);
        // Fallback if DB not set up
        return NextResponse.json({
          order_id: "mock-" + orderNumber,
          order_number: orderNumber,
        });
      }

      // Insert items
      const items = data.items.map((it: any) => ({
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product_name,
        product_image: it.product_image,
        price: it.price,
        quantity: it.quantity,
        color: it.color,
        size: it.size,
      }));
      await admin.from("order_items").insert(items);

      // Fire-and-forget email notification (don't block response)
      import("@/lib/notifications").then(({ sendOrderEmail }) => {
        sendOrderEmail({
          orderNumber: order.order_number,
          customerName: data.name,
          phone: data.phone,
          address: `${data.address}, ${data.city}, ${data.state} ${data.pincode}`,
          paymentMethod: data.payment_method,
          transactionId: data.transaction_id,
          total: data.total,
          items: data.items,
        }).catch(() => {});
      }).catch(() => {});

      return NextResponse.json({
        order_id: order.id,
        order_number: order.order_number,
      });
      } catch (e) {
        console.error("Supabase order error, falling back:", e);
        return NextResponse.json({
          order_id: "mock-" + orderNumber,
          order_number: orderNumber,
        });
      }
    }

    // Fallback: no DB, return mock order id
    return NextResponse.json({
      order_id: "mock-" + orderNumber,
      order_number: orderNumber,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
