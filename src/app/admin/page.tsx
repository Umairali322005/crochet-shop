import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AdminDashboard() {
  let productCount = 0;
  let orderCount = 0;
  let revenue = 0;
  let recentOrders: any[] = [];

  if (hasSupabase()) {
    const supabase = await createClient();
    const { count: pc } = await supabase.from("products").select("*", { count: "exact", head: true });
    productCount = pc || 0;
    const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
    recentOrders = orders || [];
    orderCount = (await supabase.from("orders").select("*", { count: "exact", head: true })).count || 0;
    const { data: allOrders } = await supabase.from("orders").select("total");
    revenue = (allOrders || []).reduce((s: number, o: any) => s + Number(o.total), 0);
  } else {
    productCount = 12;
    orderCount = 0;
    revenue = 0;
  }

  const stats = [
    { label: "Products", value: productCount, icon: "🛍️" },
    { label: "Orders", value: orderCount, icon: "📦" },
    { label: "Revenue", value: formatPrice(revenue), icon: "💰" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-6">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary-dark hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                <div>
                  <p className="font-medium text-sm">#{o.order_number}</p>
                  <p className="text-xs text-gray-500">{o.shipping_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatPrice(o.total)}</p>
                  <p className="text-xs text-gray-500">{o.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}