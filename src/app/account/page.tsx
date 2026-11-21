import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/utils";
import { LogoutButton } from "@/components/LogoutButton";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AccountPage() {
  if (!hasSupabase()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Account</h1>
        <p className="text-gray-500">Configure Supabase to enable accounts. See README.</p>
        <Link href="/products" className="btn btn-primary mt-4 inline-flex">Shop</Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold mb-4">Profile</h2>
          <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {profile?.full_name || user.email}</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {user.email}</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {profile?.phone || "—"}</p>
        </div>
        <div className="card p-6">
          <h2 className="font-bold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/orders" className="block btn btn-ghost w-full text-left">📦 My Orders</Link>
            <Link href="/wishlist" className="block btn btn-ghost w-full text-left">❤️ Wishlist</Link>
            <Link href="/cart" className="block btn btn-ghost w-full text-left">🛒 Cart</Link>
            {isAdminEmail(user.email) && (
              <Link href="/admin" className="block btn btn-primary w-full text-left">🛠️ Admin Dashboard</Link>
            )}
            <LogoutButton className="w-full text-left text-red-500 hover:bg-red-50" />
          </div>
        </div>
      </div>
    </div>
  );
}