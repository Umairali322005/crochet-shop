import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { OrderNotifyButtons } from "@/components/OrderNotifyButtons";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AdminOrders() {
  let orders: any[] = [];
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
    orders = data || [];
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">No orders yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Payment</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Notify</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-medium">#{o.order_number}</td>
                  <td className="p-3">
                    <div className="font-medium">{o.shipping_name}</div>
                    <a href={`tel:${o.shipping_phone}`} className="text-xs text-primary-dark hover:underline">
                      📞 {o.shipping_phone}
                    </a>
                  </td>
                  <td className="p-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    {o.payment_method === "cod" ? "COD" : "Easypaisa"} ({o.payment_status})
                    {o.transaction_id && <div className="text-xs text-gray-500">Txn: {o.transaction_id}</div>}
                  </td>
                  <td className="p-3">
                    <OrderStatusSelect orderId={o.id} current={o.status} />
                  </td>
                  <td className="p-3">
                    <OrderNotifyButtons
                      orderNumber={o.order_number}
                      customerName={o.shipping_name}
                      phone={o.shipping_phone}
                      address={`${o.shipping_address}, ${o.shipping_city}`}
                      paymentMethod={o.payment_method}
                      transactionId={o.transaction_id}
                      total={Number(o.total)}
                      items={(o.items || []).map((it: any) => ({ product_name: it.product_name, quantity: it.quantity, price: Number(it.price) }))}
                    />
                  </td>
                  <td className="p-3 text-gray-500">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">
                    <Link href={`/orders/${o.id}`} className="text-primary-dark hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}