import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, MessageCircle } from "lucide-react";
import { OrderNotifyButtons } from "@/components/OrderNotifyButtons";

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "03167981980";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  let order: any = null;
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .single();
    order = data;
  }

  // Fallback: build a lightweight order object from query params / id
  if (!order) {
    order = {
      id,
      order_number: sp.num || id.replace("mock-", ""),
      status: "pending",
      payment_method: sp.method || "cod",
      payment_status: "pending",
      transaction_id: sp.txn || null,
      subtotal: Number(sp.total || 0),
      shipping: 0,
      total: Number(sp.total || 0),
      shipping_name: sp.name || "Customer",
      shipping_email: "",
      shipping_phone: sp.phone || "",
      shipping_address: sp.address || "",
      shipping_city: "",
      shipping_state: "",
      shipping_pincode: "",
      items: [],
      created_at: new Date().toISOString(),
    };
  }

  const isSuccess = sp.success === "1";

  // Build WhatsApp message for admin notification
  const waMessage = encodeURIComponent(
    `🧶 *New Order - Crochet Haven*\n\n` +
      `Order #: ${order.order_number}\n` +
      `Customer: ${order.shipping_name}\n` +
      `Phone: ${order.shipping_phone}\n` +
      `Address: ${order.shipping_address}\n` +
      `Payment: ${order.payment_method === "cod" ? "Cash on Delivery" : "Easypaisa"}\n` +
      (order.transaction_id ? `Txn ID: ${order.transaction_id}\n` : "") +
      `Total: Rs ${order.total}\n\n` +
      `Please confirm & process. Thank you!`
  );
  const waLink = `https://wa.me/92${ADMIN_WHATSAPP.replace(/^0/, "")}?text=${waMessage}`;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {isSuccess && (
        <div className="card p-6 mb-6 bg-green-50 border-green-200 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-green-700">Order Placed Successfully!</h2>
          <p className="text-sm text-gray-600 mt-1">Thank you for your order. We'll process it soon.</p>

          {/* WhatsApp notify admin */}
          <div className="mt-5 p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📲 Notify the shop owner on WhatsApp
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Click below to send your order details to the shop owner on WhatsApp so they can
              confirm and process it quickly.
            </p>
            <div className="flex gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-green-500 text-white hover:bg-green-600 flex-1 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
              <OrderNotifyButtons
                orderNumber={order.order_number}
                customerName={order.shipping_name}
                phone={order.shipping_phone}
                address={order.shipping_address}
                paymentMethod={order.payment_method}
                transactionId={order.transaction_id}
                total={Number(order.total)}
                items={(order.items || []).map((it: any) => ({ product_name: it.product_name, quantity: it.quantity, price: Number(it.price) }))}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.product_image && (
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-gray-500">
                    {item.color && `${item.color} `} {item.size && `• ${item.size}`} • Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-dark">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment</span>
            <span className="font-medium">
              {order.payment_method === "cod" ? "Cash on Delivery" : "Easypaisa"} ({order.payment_status})
            </span>
          </div>
          {order.transaction_id && (
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-medium">{order.transaction_id}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border mt-4 pt-4">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p className="text-sm text-gray-600">
            {order.shipping_name}<br />
            {order.shipping_address}<br />
            {order.shipping_phone && <>Phone: {order.shipping_phone}</>}
          </p>
        </div>
      </div>

      <div className="mt-6 text-center space-x-3">
        <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-green-500 text-white hover:bg-green-600 inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" /> Notify on WhatsApp
        </a>
      </div>
    </div>
  );
}