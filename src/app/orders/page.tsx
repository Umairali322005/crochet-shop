import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function OrdersPage() {
  let orders: any[] = [];
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      orders = data || [];
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card p-5 block hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{o.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(o.created_at).toLocaleDateString("en-IN")} • {o.payment_method === "cod" ? "COD" : "Online"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-dark">{formatPrice(o.total)}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">{o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}